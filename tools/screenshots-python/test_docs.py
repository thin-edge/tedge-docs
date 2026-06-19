import json
import os
import re
import subprocess
import shlex
import shutil
import time
from dataclasses import dataclass
from typing import List, Union
from contextlib import contextmanager
import jwt
import pytest
from playwright.sync_api import Page, expect, Browser, Playwright, expect

C8Y_DOMAIN = os.getenv("C8Y_DOMAIN")
C8Y_TOKEN = os.getenv("C8Y_TOKEN")


def execute(cmd: Union[str, List], strip: bool = True) -> str:
    """Execute a command and return the output

    Arguments:
        cmd (str, list): Command to execute
        strip (bool, optional): Trim whitespace from the output (leading and trailing)
    """
    cmd_parts = cmd
    if isinstance(cmd, str):
        cmd_parts = shlex.split(cmd.strip())

    env = {
        **os.environ,
        "CI": "true",
    }
    proc = subprocess.Popen(
        cmd_parts,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        env=env,
    )
    output = []
    for line in proc.stdout.readlines():
        output.append(line)
    retval = proc.wait()
    assert retval == 0, proc.stderr
    if strip:
        return "\n".join(output).strip()
    return "\n".join(output)


def execute_shell(device: str, cmd: str) -> str:
    template = json.dumps(
        {
            "c8y_Command": {
                "text": cmd,
            },
        }
    )
    op_id = execute(
        [
            "c8y",
            "operations",
            "create",
            "-n",
            "--device",
            device,
            "--template",
            template,
            "--select=id",
            "-o=csv",
            "--force",
        ]
    )
    execute(f"c8y operations wait -n --id {op_id} --duration 10s")


@contextmanager
def tracer(context):
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        yield context
    finally:
        context.tracing.stop(path="trace.zip")


class DeviceManagementApp:
    PRELOAD_SCRIPT = """
localStorage.setItem("acceptCookieNotice", `{"required":true,"functional":false,"marketing":false,"policyVersion":"2024-12-03"}`);
"""

    def __init__(self, playwright, browser):
        # Lookup devices
        demo_device_name = os.getenv("DEMO_DEVICE", "tedge_6c6687b0")
        real_device_name = os.getenv("REAL_DEVICE", "rpi4-d83add90fe56")
        self.demo_device = execute(
            f"c8y identity get --name '{demo_device_name}' --select managedObject.id -o csv"
        )
        self.real_device = execute(
            f"c8y identity get --name '{real_device_name}' --select managedObject.id -o csv"
        )

        self._playwright = playwright
        self._playwright.selectors.set_test_id_attribute("data-cy")
        self._browser = browser

        self._context = self.create_context()
        self._context.set_default_timeout(10000)
        self._page = None

    def with_tracer(self):
        return tracer(self._context)

    def sleep(self, timeout_ms: int):
        self._page.wait_for_timeout(timeout_ms)

    @property
    def browser(self):
        return self._browser

    @property
    def context(self):
        return self._context

    @property
    def page(self):
        return self._page

    def create_context(self):
        # decode token as the XSRF-TOKEN cookie needs to be set
        # for some pages like the remote access page to load correctly
        token = jwt.decode(C8Y_TOKEN, options={"verify_signature": False})
        options = {
            "base_url": f"https://{C8Y_DOMAIN}",
            "screen": {
                "width": 1024,
                "height": 768,
            },
            "device_scale_factor": 2,
            # Record videos
            # "record_video_dir": "videos/",
            # "record_video_size":{
            #     "width": 1280,
            #     "height": 720,
            # },
        }
        context = self._browser.new_context(**options)
        context.add_init_script(script=self.PRELOAD_SCRIPT)
        context.add_cookies(
            [
                {
                    "name": "authorization",
                    "value": C8Y_TOKEN,
                    "domain": C8Y_DOMAIN,
                    "path": "/",
                },
                {
                    "name": "XSRF-TOKEN",
                    "value": token["xsrfToken"],
                    "domain": C8Y_DOMAIN,
                    "path": "/",
                },
            ]
        )
        return context

    def url(self, path) -> str:
        return f"/apps/devicemanagement/index.html#{path}"

    def toggle_navbar_left(self):
        # hide nav-bar
        header_button = self._page.get_by_test_id("header-bar--main-header-button")
        header_button.click()
        self.sleep(1000)
        header_button.blur()

    def goto(self, path: str, *, drawer_left_hide: bool = None):
        if not self._page:
            self._page = self._context.new_page()
        self._page.goto(self.url(path))

        # wait for page to load
        self._page.locator("#main-content").wait_for()
        self._page.get_by_test_id("header-bar--main-header-button").wait_for()
        self.sleep(1000)

        if drawer_left_hide:
            if self._page.locator("#navigator").is_visible():
                self.toggle_navbar_left()

        return self._page


@pytest.fixture
def dm(playwright: Playwright, browser: Browser):
    return DeviceManagementApp(playwright, browser)


def docs(path: str):
    path_normalized = path.replace("/src/", "/")
    return f"../../{path_normalized}"


#
# Page Helpers
#
@dataclass
class SoftwareItem:
    name: str = ""
    type: str = ""
    type_filter: str = ""
    description: str = ""
    version: str = ""
    url: str = ""
    file: str = ""


def add_software_item(dm: DeviceManagementApp, page: Page, item: SoftwareItem):
    """Add software repository item"""
    modal = page.get_by_role("dialog")

    page.get_by_role("textbox", name="Select or enter").focus()
    page.keyboard.type(item.name, delay=50)
    dm.sleep(1000)
    modal.get_by_role("button", name="Add new").click()
    dm.sleep(1000)

    if item.description:
        modal.get_by_role("textbox", name="Description").focus()
        page.keyboard.type(item.description, delay=10)
        dm.sleep(750)

    if item.type_filter:
        modal.get_by_role("textbox", name="Device type filter").focus()
        page.keyboard.type(item.type_filter, delay=10)
        dm.sleep(750)

    if item.type:
        modal.get_by_placeholder("yum").focus()
        page.keyboard.type(item.type, delay=50)
        dm.sleep(2000)
        page.keyboard.press("Tab")

    if item.version:
        modal.get_by_role("textbox", name="Version").fill(item.version)

    if item.url:
        modal.get_by_test_id("file-picker--file-path-input").click()

        # Use invisible space for now until an empty URL value is allowed in the UI
        # without causing a form validation error
        modal.get_by_test_id("file-picker--fileUrl").fill(item.url)
        dm.sleep(1000)
    elif item.file:
        with page.expect_file_chooser() as fc_info:
            modal.locator("c8y-drop-area").first.click()

        file_chooser = fc_info.value
        file_chooser.set_files(item.file)
        dm.sleep(1000)

    # Don't create the item as it causes issues
    modal.get_by_role("button", name="Cancel", exact=True).hover()

    modal_content = modal.locator(".modal-content")
    return modal_content


#
# Tasks
#


def test_manual_screenshot(dm: DeviceManagementApp):
    page = dm.goto(f"/", drawer_left_hide=True)
    page.pause()


def test_getting_started_page(dm: DeviceManagementApp):
    # all devices list
    page = dm.goto("/device")
    main_content = page.locator("#main-content")
    main_content.wait_for()
    dm.sleep(1000)  # wait for devices list to load
    main_content.screenshot(path=docs("docs/src/start/images/DevicesList.png"))


def test_device_send_events(dm: DeviceManagementApp):
    # Create an operation
    event_text = "A door was closed"
    execute_shell(
        dm.demo_device,
        f"""
        tedge mqtt pub te/device/main///e/door '{{"text": "{event_text}"}}'
    """.strip(),
    )

    # all devices list
    page = dm.goto(f"/device/{dm.demo_device}/events", drawer_left_hide=True)
    dm.sleep(1000)

    row = page.locator(".c8y-list--timeline__item").filter(has_text=event_text).first
    row.get_by_role("button").last.click()

    dm.sleep(1000)
    row.screenshot(path=docs("docs/src/start/images/SendingEvents.png"))


def test_getting_started_events(dm: DeviceManagementApp):
    # Add Software
    page = dm.goto("/software")
    dm.sleep(1000)  # wait for devices list to load

    page.set_viewport_size({"width": 1600, "height": 1200})
    page.get_by_text("Add software").click()

    modal = page.locator(".modal-content")
    modal.wait_for()
    modal.screenshot(path=docs("docs/src/start/images/AddSoftware.png"))
    page.get_by_text("Cancel").click()

    # Add Configuration
    page.set_viewport_size({"width": 1024, "height": 768})
    page.get_by_text("Configuration repository").click()
    dm.sleep(2000)  # wait for devices list to load
    page.screenshot(path=docs("docs/src/start/images/ConfigurationManagement.png"))


def test_configuration(dm: DeviceManagementApp):
    page = dm.goto(
        f"/device/{dm.demo_device}/device-configuration", drawer_left_hide=True
    )
    page.set_viewport_size({"width": 1280, "height": 1024})

    config_type = "tedge-configuration-plugin"

    # Get configuration
    sub_page = page.locator("c8y-device-configuration")
    sub_page.get_by_text(config_type).click()
    sub_page.get_by_text("Get snapshot from device").click()
    dm.sleep(3000)  # Wait for operation
    page.screenshot(path=docs("docs/src/images/c8y-config-plugin-upload.png"))

    # Set configuration
    set_config_name = "default tedge integration"
    sub_page = page.locator("c8y-device-configuration-list").nth(1)
    sub_page.get_by_text(set_config_name, exact=True).click()
    page.get_by_text("Send configuration to device").click()
    dm.sleep(3000)  # Wait for operation
    page.screenshot(path=docs("docs/src/images/c8y-config-plugin-download.png"))

    shutil.copy(
        docs("docs/src/images/c8y-config-plugin-download.png"),
        docs("docs/src/start/images/ChangeConfiguration.png"),
    )


def test_device_info(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.real_device}/device-info")
    page.set_viewport_size({"width": 1900, "height": 1400, "device_scale_factor": 2})
    dm.sleep(1000)
    page.locator(".device-status-widget").screenshot(
        path=docs("docs/src/images/c8y_availability_monitoring.png")
    )
    page.locator(".asset-properties").screenshot(
        path=docs("docs/src/images/c8y_custom_fragments.png")
    )
    dm.sleep(3000)


def test_measurements(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.real_device}/measurements", drawer_left_hide=True)
    dm.sleep(3000)
    page.screenshot(path=docs("docs/src/start/images/collectd-metrics.png"))


def test_add_software(dm: DeviceManagementApp):
    # Add Software
    page = dm.goto("/software")
    page.locator("#main-content").wait_for()
    dm.sleep(1000)  # wait for devices list to load

    page.set_viewport_size({"width": 1600, "height": 1200, "device_scale_factor": 2})
    page.get_by_text("Add software").click()

    modal_content = page.locator(".modal-content")
    modal_content.wait_for()

    modal_content.screenshot(
        path=docs("docs/src/start/images/add-new-software-to-repo.png")
    )
    page.get_by_text("Cancel").click()


def test_add_software_apama(dm: DeviceManagementApp):
    # Add Apama software item
    page = dm.goto("/software")

    page.set_viewport_size({"width": 1600, "height": 1200, "device_scale_factor": 2})
    page.get_by_text("Add software").click()

    item = SoftwareItem(
        name="apama-quick-start",
        type="apama",
        description="Apama quick start example",
        version="1.0",
        file="files/apama-quick-start.zip",
    )
    modal = add_software_item(dm, page, item)
    dm.sleep(1000)

    modal.screenshot(
        path=docs(
            "docs/src/images/apama-plugin/apama-project-c8y-software-repository.png"
        )
    )
    page.get_by_text("Cancel").click()


def test_log_request(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.demo_device}/logs", drawer_left_hide=True)
    dm.sleep(1000)  # wait for devices list to load

    page.get_by_role("button", name="Request log file").click()

    # Type of log
    log_type = page.get_by_test_id("logViewer--filters-log-type")
    log_type.click()

    # List of log types (include the button, so we have to offset the coordinates vertically)
    log_request_dialog = page.get_by_test_id("logViewer--dropdown-menu-action-bar")
    box = log_request_dialog.bounding_box()
    page.screenshot(
        path=docs("docs/src/images/tedge-log-plugin_log-types.png"),
        clip={
            "x": box["x"],
            "y": box["y"] - 40,
            "width": box["width"],
            "height": box["height"] + 40,
        },
    )

    log_type.get_by_role("option").get_by_text("dpkg").click()

    # dm.sleep(2000)
    page.get_by_role("button", name="Request log file", exact=True).click()

    # Wait for operation to complete
    dm.sleep(5000)

    # expand the log request
    page.get_by_title("Expand").first.click()
    dm.sleep(1000)

    page.screenshot(path=docs("docs/src/start/images/RequestLogfile.png"))


def test_device_profile_repository(dm: DeviceManagementApp):
    page = dm.goto(f"/device-profiles")
    dm.sleep(2000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/device-profile-repo-1-list.png")
    )
    dm.sleep(3000)

    page.get_by_role("button", name="Add device profile").click()
    dm.sleep(1000)
    page.screenshot(
        path=docs(
            "docs/src/operate/c8y/images/device-profile-repo-2-add-device-profile-empty.png"
        )
    )

    profile_name = "iot-linux-v1"
    device_profile_id = execute(
        f"c8y deviceprofiles get --id '{profile_name}' --select id -o csv"
    )
    page = dm.goto(f"/device-profiles/{device_profile_id}")
    dm.sleep(1000)
    page.screenshot(
        path=docs(
            "docs/src/operate/c8y/images/device-profile-repo-4-device-profile-details.png"
        )
    )


def test_device_profile_apply(dm: DeviceManagementApp):
    profile_name = "iot-linux-v1"
    page = dm.goto(f"/device/{dm.demo_device}/device-profile", drawer_left_hide=True)

    main_content = page.locator("#main-content")

    select_profile = main_content.get_by_test_id("typeahead-button")
    select_profile.click()

    main_content.get_by_text(profile_name).click()
    dm.sleep(1000)

    page.screenshot(
        path=docs("docs/src/operate/c8y/images/device-profile-install-1-select.png")
    )

    # apply profile (don't wait for it to be completed)
    main_content.get_by_test_id(
        "device-tab-profile--Assign-device-profile-button"
    ).click()
    dm.sleep(2000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/device-profile-install-2-assign.png")
    )


def test_device_restart(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.demo_device}/device-info", drawer_left_hide=True)
    dm.sleep(2000)

    restart_button = page.get_by_test_id("c8y-device-status--restart-btn")
    dm.sleep(2000)
    page.locator(".device-status-widget").screenshot(
        path=docs("docs/src/images/restart-button.png")
    )

    restart_button.click()
    dm.sleep(2000)
    page.screenshot(path=docs("docs/src/images/restart-button-red-highlight.png"))

    dm.sleep(3000)
    page.get_by_role("link", name="Control").click()
    dm.sleep(5000)


def test_remote_access(dm: DeviceManagementApp):
    # Start on device-info, then click the remote access tab so that it is focussed
    # in the screenshot
    page = dm.goto(f"/device/{dm.demo_device}/device-info", drawer_left_hide=True)
    dm.sleep(2000)

    # Remote access list
    page.locator("a", has_text="Remote access").click()
    dm.sleep(2000)
    page.screenshot(path=docs("docs/src/images/c8y-remote-access_dm.png"))

    # Create new endpoint
    page.get_by_test_id("remoteAccessConfigurationList--add-endpoint").click()
    dm.sleep(2000)
    page.screenshot(path=docs("docs/src/images/c8y-remote-access_endpoint.png"))
    page.keyboard.press("Escape")

    # Connect
    page.locator("c8y-remote-access-connect-button").first.click()
    dm.sleep(10000)
    page.keyboard.type("cat /etc/os*", delay=50)
    page.keyboard.press("Enter")
    dm.sleep(2000)
    page.screenshot(
        path=docs("docs/src/images/c8y-remote-access_websocket.png"), full_page=True
    )
    dm.sleep(2000)


def test_device_software_install(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.demo_device}/software", drawer_left_hide=True)
    dm.sleep(2000)

    # Install software
    page.get_by_title("Install software").click()
    dm.sleep(2000)

    software_name = "nodered"
    software_description = "NodeRED compose file"
    software_version = "4.0.3-22-minimal-podman"

    modal = page.get_by_role("dialog")

    filter_input = modal.get_by_test_id("filter-input--filter-input")
    filter_input.fill(software_name)
    filter_input.press("Enter")
    dm.sleep(2000)

    software_item = modal.locator("c8y-li").filter(has_text=software_description)
    software_item.get_by_test_id("c8y-li--collapse-btn").click()
    dm.sleep(2000)

    software_item.locator("c8y-li").filter(has_text=software_version).locator(
        "c8y-li-radio"
    ).click()

    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-install-1-select.png")
    )

    modal.get_by_role("button", name="Install").click()

    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-install-2-review.png")
    )
    page.get_by_role("button", name="Apply changes").click()
    dm.sleep(2000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-install-3-apply.png")
    )


def test_device_software_delete(dm: DeviceManagementApp):
    page = dm.goto(f"/device/{dm.demo_device}/software", drawer_left_hide=True)
    dm.sleep(2000)
    #
    # Delete software
    #
    delete_software = "collectd-core"

    # Select
    page.get_by_role("searchbox").fill(delete_software)
    page.get_by_role("searchbox").press("Enter")
    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-remove-1-select.png")
    )

    # Review
    page.locator("c8y-li").filter(has_text=delete_software).get_by_label(
        "Remove"
    ).click()
    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-remove-2-review.png")
    )

    # Apply
    page.get_by_role("button", name="Apply changes").click()
    dm.sleep(2000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/software-remove-3-apply.png")
    )


def test_software_repo(dm: DeviceManagementApp):
    page = dm.goto(f"/software", drawer_left_hide=True)
    dm.sleep(2000)
    page.screenshot(path=docs("docs/src/operate/c8y/images/software-repo-1-list.png"))

    page.get_by_role("button", name="Add software").click()
    dm.sleep(1000)

    # Increase height so that the dialog box is fully visible without scrolling
    page.set_viewport_size({"width": 1024, "height": 1024})

    item = SoftwareItem(
        name="app1",
        type="apt",
        description="My custom application that utilizes thin-edge.io",
        version="latest",
        url="\u2800",
    )
    modal = add_software_item(dm, page, item)
    dm.sleep(1000)

    # Don't create the item as it causes issues
    modal.get_by_role("button", name="Cancel", exact=True).focus()
    dm.sleep(750)
    modal.locator(".viewport-modal").screenshot(
        path=docs("docs/src/operate/c8y/images/software-repo-2-add.png")
    )


def test_device_registration_cumulocity_certificate_authority(dm: DeviceManagementApp):
    device_xid = "tedge_12dbd3f"
    # remove an existing device registration request
    execute(
        f"c8y deviceregistration delete --id '{device_xid}' --silentExit --silentStatusCodes 404"
    )

    page = dm.goto(f"/deviceregistration", drawer_left_hide=True)
    dm.sleep(1000)
    page.get_by_test_id("register-device--dropdown-button").click()
    dm.sleep(1000)

    register_button = page.get_by_role("button", name="General").first
    register_button.focus()
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/register-c8y-ca-register-1-device.png")
    )
    register_button.click()
    dm.sleep(1000)

    page.get_by_title("Create device certificates").click()
    dm.sleep(1000)

    page.get_by_role("textbox", name="Device ID").click()
    page.keyboard.type(device_xid, delay=50)
    dm.sleep(1000)

    page.get_by_role("textbox", name="One-time password").click()
    page.keyboard.type("IwXcbijlYJud-oZkFze8aAn2G.pPOSmr", delay=50)
    dm.sleep(1000)

    page.get_by_test_id("next").focus()
    dm.sleep(500)
    page.screenshot(
        path=docs(
            "docs/src/operate/c8y/images/register-c8y-ca-register-2-form-details.png"
        )
    )
    dm.sleep(1000)
    page.get_by_test_id("next").click()

    dm.sleep(1000)
    page.screenshot(
        path=docs(
            "docs/src/operate/c8y/images/register-c8y-ca-register-3-form-complete.png"
        )
    )

    dm.sleep(1000)
    page.get_by_role("button", name="Close")

    dm.sleep(1000)


def test_community_plugins(page: Page):
    page.goto("https://github.com/topics/thin-edge?o=desc&s=updated")
    page.screenshot(path=docs("docs/src/operate/plugins/github_plugins_list.png"))


def test_smart_rest_2_templates_manual(dm: DeviceManagementApp):
    # delete any existing registration requests
    template_name = "custom_devmgmt"
    mo_id = execute(
        f"c8y identity get --name '{template_name}' --type c8y_SmartRest2DeviceIdentifier --select managedObject.id -o csv --silentExit --silentStatusCodes 404"
    )
    if mo_id:
        execute(f"c8y inventory delete --id '{mo_id}' --force")

    page = dm.goto(f"/smart-rest-templates", drawer_left_hide=False)

    page.screenshot(
        path=docs("docs/src/operate/c8y/images/smartrest-template-list-empty.png")
    )

    page.get_by_test_id("add-template").click()

    modal = page.locator(".modal-content")
    modal.wait_for()

    modal.get_by_label("Template name").focus()
    page.keyboard.type(template_name, delay=50)
    dm.sleep(750)

    modal.get_by_label("Template ID").focus()
    page.keyboard.type(template_name, delay=50)

    modal.get_by_role("button", name="Cancel").focus()

    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/smartrest-template-create-new.png")
    )

    dm.sleep(1000)
    modal.get_by_role("button", name="Continue").click()

    page.get_by_role("link", name="Responses").click()

    # add a button
    page.get_by_role("button", name="Add response").click()
    page.get_by_test_id("responses--add-response-btn")

    #
    # Fill in form for a new Response
    #
    page.get_by_test_id("responseEditor--response-id").focus()
    page.keyboard.type("dm101", delay=50)

    page.get_by_test_id("responseEditor--response-name").focus()
    page.keyboard.type("set_wifi", delay=50)

    page.get_by_test_id("responseEditor--response-base-pattern").focus()
    page.keyboard.type("set_wifi", delay=50)

    page.get_by_test_id("responseEditor--response-condition").focus()
    page.keyboard.type("set_wifi", delay=50)

    # pattern 1
    page.get_by_test_id("responseEditor--add-pattern-btn").click()
    pattern = page.get_by_test_id("responseEditor--response-pattern-path").nth(0)
    pattern.focus()
    page.keyboard.type("name", delay=50)

    # pattern 2
    page.get_by_test_id("responseEditor--add-pattern-btn").click()
    pattern = page.get_by_test_id("responseEditor--response-pattern-path").nth(1)
    pattern.focus()
    page.keyboard.type("ssid", delay=50)

    # pattern 3
    page.get_by_test_id("responseEditor--add-pattern-btn").click()
    pattern = page.get_by_test_id("responseEditor--response-pattern-path").nth(2)
    pattern.focus()
    page.keyboard.type("type", delay=50)

    dm.sleep(1000)

    page.screenshot(
        path=docs("docs/src/operate/c8y/images/smartrest-template-add-operation.png")
    )

    # save
    page.get_by_test_id("responseEditor--save-btn").click()
    dm.sleep(1000)

    # List of templates
    dm.goto(f"/smart-rest-templates", drawer_left_hide=False)
    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/custom-smartrest-template-list.png")
    )


def test_smart_rest_2_templates_import(dm: DeviceManagementApp):
    # delete any pre-existing template
    template_name = "custom_devmgmt"
    mo_id = execute(
        f"c8y identity get --name '{template_name}' --type c8y_SmartRest2DeviceIdentifier --select managedObject.id -o csv --silentExit --silentStatusCodes 404"
    )
    if mo_id:
        execute(f"c8y inventory delete --id '{mo_id}' --force")

    # Import a SmartREST 2.0 template
    page = dm.goto(f"/smart-rest-templates", drawer_left_hide=False)

    page.get_by_role("button", name="Import template").click()

    dm.sleep(1000)
    page.screenshot(
        path=docs("docs/src/operate/c8y/images/smartrest-template-import.png")
    )

    with page.expect_file_chooser() as fc_info:
        page.locator("#smartRestTemplateFileInput").get_by_role("button").first.click()

    file_chooser = fc_info.value
    file_chooser.set_files("files/custom_devmgmt.json")
    dm.sleep(1000)

    page.screenshot(
        path=docs(
            "docs/src/operate/c8y/images/smartrest-template-import-after-selection.png"
        )
    )

    # Import
    page.get_by_test_id("importTemplate-modal--import-btn").click()

    dm.sleep(1000)

    #
    # Create an operation
    #
    # Note: Device actions are required here to enable a handler
    template = """{set_wifi:{name:"Factory Wifi",ssid:"factory-onboarding-wifi",type:"WPA3-Personal"}}"""
    execute(
        f"""
c8y operations create -n --device '{dm.demo_device}' --template '{template}' --description 'Configure wifi' --force
"""
    )

    page = dm.goto(f"/device/{dm.demo_device}/control", drawer_left_hide=True)

    dm.sleep(5000)

    page.screenshot(
        path=docs("docs/src/operate/c8y/images/smartrest-custom-operation-control.png")
    )
