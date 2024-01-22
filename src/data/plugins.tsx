const TAGS = {
  AGENT: 'Agent',
  CUMULOCITY: 'Cumulocity IoT',
  OPERATION: 'Operation',
  MICROCONTROLLER: 'Microcontroller',
  YOCTO: 'Yocto',
  RUGPI: 'Rugpi',
  IMAGE: 'Image',
  SM_PLUGIN: 'Software Management Plugins',
  CONTAINER: 'Container',
  UI: 'UI',
  TOOL: 'Tool',
  PROTOCOLS: 'Protocols',
  NODE_RED: 'NodeRED',
  BENCHMARK: 'Benchmark',
  INIT_SYSTEM: 'Init Systems',
  RASPBERRY_PI: 'Raspberry Pi',
  TELEMETRY: 'Telemetry',
  CONFIG: 'Configuration',
  SERVICE: 'Service',
  BOOTSTRAP: 'Bootstrap',
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
    description:
      'Micropython agent (for microcontrollers) to connect to local thin-edge.io to manage devices like Raspberry Pi Pico W',
    tags: [TAGS.AGENT, TAGS.MICROCONTROLLER, TAGS.RASPBERRY_PI],
  },
  {
    name: 'python-tedge-agent',
    sourceUrl: 'https://github.com/thin-edge/python-tedge-agent',
    description:
      'Python3 agent to connect to local thin-edge.io to manage devices',
    tags: [TAGS.AGENT],
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
    name: 'meta-tedge-project',
    sourceUrl: 'https://github.com/thin-edge/meta-tedge-project',
    packageUrl: 'https://github.com/thin-edge/meta-tedge-project',
    description:
      'Yocto Project to easily build multiple thin-edge.io images using different firmware update layers',
    tags: [TAGS.IMAGE, TAGS.YOCTO],
  },
  {
    name: 'meta-tedge',
    sourceUrl: 'https://github.com/thin-edge/meta-tedge',
    packageUrl: 'https://github.com/thin-edge/meta-tedge',
    description: 'Yocto Layer to build and install thin-edge.io from source',
    tags: [TAGS.IMAGE, TAGS.YOCTO],
  },
  {
    name: 'meta-tedge-bin',
    sourceUrl: 'https://github.com/thin-edge/meta-tedge-bin',
    packageUrl: 'https://github.com/thin-edge/meta-tedge-bin',
    description:
      'Yocto Layer to install thin-edge.io using the officially built binaries. This layer reduces the build time considering as it avoids having to build the Rust compiler and tooling.',
    tags: [TAGS.IMAGE, TAGS.YOCTO],
  },

  // Protocols
  {
    name: 'modbus',
    sourceUrl: 'https://github.com/thin-edge/modbus-plugin',
    description:
      'Modbus gateway to connect to modbus devices and publish to the cloud via thin-edge.io.',
    tags: [TAGS.PROTOCOLS],
  },
  {
    name: 'OPC UA',
    sourceUrl:
      'https://github.com/thin-edge/thin-edge.io_examples/tree/main/opcua-solution',
    description:
      'OPC UA Gateway example which uses the Cumulocity IoT [opcua-device-gateway](https://github.com/thin-edge/opcua-device-gateway-container) to connect to OPC UA Servers and thin-edge.io',
    tags: [TAGS.PROTOCOLS],
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

  // UI
  {
    name: 'tedge-management-ui',
    description: 'Local UI to view and manage thin-edge.io',
    sourceUrl: 'https://github.com/thin-edge/tedge-management-ui',
    tags: [TAGS.UI],
  },
  {
    name: 'tedge-demo-container',
    description:
      'Demo container setup to showcase thin-edge.io and all its features',
    sourceUrl: 'https://github.com/thin-edge/tedge-demo-container',
    packageUrl: 'https://github.com/thin-edge/tedge-demo-container',
    tags: [TAGS.EXAMPLE, TAGS.CONTAINER],
  },
];

// Sort plugins
export const Plugins = PluginsList.sort((a, b) =>
  a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1,
);
