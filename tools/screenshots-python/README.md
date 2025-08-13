# Screenshot generation

**Note** These instructions and tools are still in development/refinement so there are a lot of hacks and manual timing (e.g. sleeps) is used.

The screenshot tool uses [playwright](https://playwright.dev/python/) to automate the task of taking screenshots in a consistent manner.

Since pytest is used as the runner (as this is the when using playwright with python), all of tasks are defined as "tests" although it is not actually testing anything.

## Goals

The goals of the screenshot tool is to:

* Normalize the screenshots (similar screen sizing, consistent cropping)
* Automate most of the tedious tasks (though the automation will likely break from time to time if the UI changes significantly)
* Prevent leaking personal information when taking the screenshot (e.g. type of browser, browser extensions installed, exact URL etc.)
* Use semi-automation for the more complicated screenshots when automation is too costly/fragile (automate spawning a new windows, navigating to the correct page and then let the user manually do the rest)

**Potential future goals**

The following goals are being considered (pending on technical difficulty / quality of the output)

* Use the tasks to also record videos of each feature (this already sort of works, but the video quality is lacking)

## Pre-requisites

The following tools are required:

* python3 (>=3.9)
* [go-c8y-cli](https://goc8ycli.netlify.app/) to handle authentication
* [c8y-tedge](https://github.com/thin-edge/c8y-tedge) (go-c8y-cli extension for thin-edge.io)
* Valid Cumulocity go-c8y-cli session which uses a TOKEN for authentication (currently basic auth is not supported)

Some screenshots require a device, therefore you will need to have at setup two types of devices and connect them to your Cumulocity tenant. The following types of devices are used, where the user can specify the name of each type of device that can then be used to take the screenshots of:

* A real device (ideally a device which is using a Yocto built image from [meta-tedge](https://github.com/thin-edge/meta-tedge/actions/workflows/build.yaml))

* A demo device - You can start a demo device using

    ```sh
    c8y tedge demo start tedge_6c6687b0
    ```

Once you have these devices, and pre-requisites, then you can proceed to the getting started section.

## Getting Started

Note: The screenshots will be written to symlinked folder of the "next" docs which is referenced under `<project_dir>/docs/...`

1. Install dependencies

    ```sh
    just setup
    ```

1. Activate the python virtual environment created in the previous step

    ```sh
    . .venv/bin/activate
    ```

1. Activate your go-c8y-cli session for the tenant you want to 

    ```sh
    set-session
    ```

1. Configure which device names you want to include in your screenshot by editing the `.env` file that was created in step 1

    ```sh
    DEMO_DEVICE=tedge_6c6687b0
    REAL_DEVICE=rpi4-d83add90fe56
    ```

    **Note**: The device's must exist in the tenant before taking the screenshots. go-c8y-cli is used to resolve the device name to the managed object id which is used in the API calls.

1. Run the tasks to create the screenshots

    **Generate all screenshots**

    ```sh
    just take-screenshots
    ```

    **Generate screenshots**

    ```sh
    just take-screenshots-for "test_getting_started_page"
    ```

    **Run specific task in debug mode**

    ```sh
    just debug "test_getting_started_page"    
    ```
