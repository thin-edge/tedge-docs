const TAGS = {
  AGENT: 'Agent',
  BENCHMARK: 'Benchmark',
  BOOTSTRAP: 'Bootstrap',
  CONFIG: 'Configuration',
  CONTAINER: 'Container',
  CUMULOCITY: 'Cumulocity IoT',
  EXAMPLE: 'Example',
  IMAGE: 'Image',
  INIT_SYSTEM: 'Init Systems',
  MICROCONTROLLER: 'Microcontroller',
  NODE_RED: 'NodeRED',
  OPERATION: 'Operation',
  PROTOCOLS: 'Protocols',
  RASPBERRY_PI: 'Raspberry Pi',
  RUGPI: 'Rugpi',
  SERVICE: 'Service',
  SM_PLUGIN: 'Software Management Plugins',
  TELEMETRY: 'Telemetry',
  TOOL: 'Tool',
  UI: 'UI',
  YOCTO: 'Yocto',
  PKI: 'PKI',
};

export interface IPlugin {
  name: string;
  sourceUrl?: string;
  packageUrl?: string;
  description: string;
  tags: string[];
}

const PluginsList: IPlugin[] = [
  // Agents
  {
    name: 'rpi-pico-client',
    sourceUrl: 'https://github.com/thin-edge/rpi-pico-client',
    packageUrl: 'https://github.com/thin-edge/rpi-pico-client',
    description:
      'Micropython agent (for microcontrollers) to connect to local thin-edge.io to manage devices like Raspberry Pi Pico W',
    tags: [TAGS.AGENT, TAGS.MICROCONTROLLER, TAGS.RASPBERRY_PI],
  },
  {
    name: 'python-tedge-agent',
    sourceUrl: 'https://github.com/thin-edge/python-tedge-agent',
    packageUrl: 'https://github.com/thin-edge/python-tedge-agent',
    description:
      'Python3 agent to connect to local thin-edge.io to manage devices',
    tags: [TAGS.AGENT],
  },
  {
    name: 'freertos-esp32-client',
    sourceUrl: 'https://github.com/thin-edge/freertos-esp32-client',
    packageUrl: 'https://github.com/thin-edge/freertos-esp32-client',
    description:
      'thin-edge.io child device client to run on an esp32 microcontroller',
    tags: [TAGS.AGENT, TAGS.MICROCONTROLLER],
  },

  // Configuration
  {
    name: 'tedge-config2mqtt-watcher',
    sourceUrl: 'https://github.com/thin-edge/tedge-config2mqtt-watcher',
    description:
      'Services which watches the tedge.toml file and publishes message on the local MQTT broker',
    tags: [TAGS.CONFIG, TAGS.SERVICE],
  },

  // Init Systems
  {
    name: 'tedge-sysvinit',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description: 'thin-edge.io sysvinit service definitions',
    tags: [TAGS.INIT_SYSTEM],
  },
  {
    name: 'tedge-systemd',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description:
      'thin-edge.io systemd service definitions. Note: These definitions are provided to make it easier to add into Yocto builds.',
    tags: [TAGS.INIT_SYSTEM],
  },
  {
    name: 'tedge-openrc',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description: 'thin-edge.io OpenRC service definitions',
    tags: [TAGS.INIT_SYSTEM],
  },
  {
    name: 'tedge-runit',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description: 'thin-edge.io runit service definitions',
    tags: [TAGS.INIT_SYSTEM],
  },
  {
    name: 'tedge-s6overlay',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description: 'thin-edge.io s6overlay service definitions',
    tags: [TAGS.INIT_SYSTEM],
  },
  {
    name: 'tedge-supervisord',
    sourceUrl: 'https://github.com/thin-edge/tedge-services',
    description: 'thin-edge.io supervisord service definitions',
    tags: [TAGS.INIT_SYSTEM],
  },

  // Operations
  {
    name: 'c8y-command-plugin',
    sourceUrl: 'https://github.com/thin-edge/c8y-command-plugin',
    description: 'Execute shell commands via MQTT',
    tags: [TAGS.OPERATION, TAGS.CUMULOCITY],
  },
  {
    name: 'c8y-textconfig-plugin',
    sourceUrl: 'https://github.com/thin-edge/c8y-textconfig-plugin',
    description: 'Send text-based configuration via MQTT',
    tags: [TAGS.OPERATION, TAGS.CUMULOCITY],
  },

  // Images
  {
    name: 'tedge-rugpi-image',
    sourceUrl: 'https://github.com/thin-edge/tedge-rugpi-image',
    packageUrl: 'https://github.com/thin-edge/tedge-rugpi-image',
    description:
      'Build Raspberry Pi images with in-built support for OS updates using thin-edge.io and [Rugpi](https://github.com/silitics/rugpi)',
    tags: [TAGS.IMAGE, TAGS.RASPBERRY_PI],
  },
  {
    name: 'tedge-rugpi-core',
    sourceUrl: 'https://github.com/thin-edge/tedge-rugpi-core',
    packageUrl: 'https://github.com/thin-edge/tedge-rugpi-core',
    description:
      'thin-edge.io rugpi images/recipes used by the tedge-rugpi-image project',
    tags: [TAGS.IMAGE, TAGS.RASPBERRY_PI],
  },
  {
    name: 'meta-tedge',
    sourceUrl: 'https://github.com/thin-edge/meta-tedge',
    packageUrl: 'https://github.com/thin-edge/meta-tedge',
    description: 'Yocto Layer to build and install thin-edge.io from source (including kas project files which makes it easy to build Over-the-Air enabled images)',
    tags: [TAGS.IMAGE, TAGS.YOCTO],
  },

  // Protocols
  {
    name: 'modbus-plugin',
    sourceUrl: 'https://github.com/thin-edge/modbus-plugin',
    packageUrl: 'https://github.com/thin-edge/modbus-plugin',
    description:
      'Modbus gateway to connect to modbus devices and publish to the cloud via thin-edge.io.',
    tags: [TAGS.PROTOCOLS],
  },
  {
    name: 'opcua-device-gateway',
    sourceUrl:
      'https://github.com/thin-edge/thin-edge.io_examples/tree/main/opcua-solution',
    packageUrl:
      'https://github.com/thin-edge/thin-edge.io_examples/tree/main/opcua-solution',
    description:
      'OPC UA Gateway example which uses the Cumulocity IoT [opcua-device-gateway](https://github.com/thin-edge/opcua-device-gateway-container) to connect to OPC UA Servers and thin-edge.io',
    tags: [TAGS.PROTOCOLS, TAGS.EXAMPLE],
  },

  // Software management plugins
  {
    name: 'tedge-apk-plugin',
    description: 'Manage Alpine Linux (apk) Packages',
    tags: [TAGS.SM_PLUGIN],
  },
  {
    name: 'tedge-rpm-plugin',
    description: 'Manage rpm packages via dnf/microdnf/zypper',
    tags: [TAGS.SM_PLUGIN],
  },
  {
    name: 'tedge-snap-plugin',
    description: 'Manage snap packages on Ubuntu',
    tags: [TAGS.SM_PLUGIN],
  },
  {
    name: 'tedge-container-plugin',
    description: 'Manage container or container groups (e.g. docker compose)',
    tags: [TAGS.SM_PLUGIN, TAGS.CONTAINER],
  },
  {
    name: 'tedge-nodered-plugin',
    description: 'Manage NodeRED flows',
    tags: [TAGS.SM_PLUGIN, TAGS.NODE_RED],
  },
  {
    name: 'tedge-archive-plugin',
    description:
      'thin-edge.io archive software management plugin for devices without any package managers',
    tags: [TAGS.SM_PLUGIN],
  },

  // Telemetry
  {
    name: 'tedge-inventory-plugin',
    description:
      'Collect device information periodically via simple script based interface',
    tags: [TAGS.TELEMETRY],
  },

  // Tools
  {
    name: 'c8y-tedge',
    description:
      '[go-c8y-cli](https://goc8ycli.netlify.app/) extension to provide common utilities to help with bootstrapping thin-edge.io devices to Cumulocity IoT',
    sourceUrl: 'https://github.com/thin-edge/c8y-tedge',
    packageUrl: 'https://github.com/thin-edge/c8y-tedge',
    tags: [TAGS.TOOL, TAGS.BOOTSTRAP],
  },
  {
    name: 'tedge-benchmark',
    description:
      'Python based MQTT benchmarking package to test the throughput of the MQTT message on a target device',
    sourceUrl: 'https://github.com/thin-edge/tedge-benchmark',
    tags: [TAGS.TOOL, TAGS.BENCHMARK],
  },
  {
    name: 'tedge-monit-setup',
    description: 'thin-edge.io community plugin with sensible monit defaults',
    sourceUrl: 'https://github.com/thin-edge/tedge-monit-setup',
    packageUrl: 'https://github.com/thin-edge/tedge-monit-setup',
    tags: [TAGS.TOOL],
  },
  {
    name: 'tedge-collectd-setup',
    description: 'thin-edge.io community plugin to install/setup collectd',
    sourceUrl: 'https://github.com/thin-edge/tedge-collectd-setup',
    packageUrl: 'https://github.com/thin-edge/tedge-collectd-setup',
    tags: [TAGS.TOOL],
  },

  // UI
  {
    name: 'tedge-management-ui',
    description: 'Local UI to view and manage thin-edge.io',
    sourceUrl: 'https://github.com/thin-edge/tedge-management-ui',
    packageUrl: 'https://github.com/thin-edge/tedge-management-ui',
    tags: [TAGS.UI],
  },
  {
    name: 'cumulocity-remote-access-cloud-http-proxy',
    description:
      'A Cumulocity IoT microservice that allows to proxy HTTP requests through the cloud to an HTTP server running on a Cumulocity IoT connected device',
    sourceUrl:
      'https://github.com/SoftwareAG/cumulocity-remote-access-cloud-http-proxy',
    packageUrl:
      'https://github.com/SoftwareAG/cumulocity-remote-access-cloud-http-proxy',
    tags: [TAGS.UI, TAGS.CUMULOCITY, TAGS.RUGPI, TAGS.NODE_RED],
  },
  {
    name: 'tedge-demo-container',
    description:
      'Demo container setup to showcase thin-edge.io and all its features',
    sourceUrl: 'https://github.com/thin-edge/tedge-demo-container',
    packageUrl: 'https://github.com/thin-edge/tedge-demo-container',
    tags: [TAGS.EXAMPLE, TAGS.CONTAINER],
  },

  // Deployments
  {
    name: 'tedge-standalone',
    description:
      'Run thin-edge.io as standalone without any init system and using static binaries include the MQTT broker',
    sourceUrl: 'https://github.com/thin-edge/tedge-standalone',
    packageUrl: 'https://github.com/thin-edge/tedge-standalone',
    tags: [TAGS.IMAGE],
  },
  {
    name: 'tedge-container-bundle',
    description:
      'thin-edge.io. s6-overlay container setup to run all the components in a single container',
    sourceUrl: 'https://github.com/thin-edge/tedge-container-bundle',
    packageUrl: 'https://github.com/thin-edge/tedge-container-bundle',
    tags: [TAGS.IMAGE, TAGS.CONTAINER],
  },
  {
    name: 'tedge-actia-tgur',
    description: 'thin-edge.io integration for Actia TGUR devices',
    sourceUrl: 'https://github.com/thin-edge/tedge-actia-tgur',
    packageUrl: 'https://github.com/thin-edge/tedge-actia-tgur',
    tags: [TAGS.IMAGE],
  },
  {
    name: 'homebrew-tedge',
    description: 'Homebrew tap to install thin-edge.io on MacOS',
    sourceUrl: 'https://github.com/thin-edge/homebrew-tedge',
    packageUrl: 'https://github.com/thin-edge/homebrew-tedge',
    tags: [TAGS.IMAGE],
  },

  // PKI
  {
    name: 'tedge-pki-smallstep',
    description: 'Local PKI integration with thin-edge.io using Smallstep',
    sourceUrl: 'https://github.com/thin-edge/tedge-pki-smallstep',
    packageUrl: 'https://github.com/thin-edge/tedge-pki-smallstep',
    tags: [TAGS.PKI],
  },
];

// Sort plugins
export const Plugins = PluginsList.sort((a, b) =>
  a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1,
);
