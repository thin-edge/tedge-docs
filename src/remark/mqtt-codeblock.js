
const visit = require('unist-util-visit');
const is = require('unist-util-is');
const { convertToMosquitto, prettify, parseTedgeCommand, convertToTedgeCLI } = require('./tedge');
const metaUtils = require('./meta');

const importNodes = [
  {
    type: "import",
    value: "import Tabs from '@theme/Tabs';",
  },
  {
    type: "import",
    value: "import TabItem from '@theme/TabItem';",
  },
];

function createCodeExample(code, converter, format='legacy', title='') {
  const api = parseTedgeCommand(code, format, false);

  if (converter === 'mosquitto') {
    return [
      {
        type: 'code',
        lang: 'sh',
        meta: title ? `title="${title}"` : ``,
        value: convertToMosquitto(api),
      }
    ];
  }
  if (converter === 'mqtt') {
    if (api.action == 'pub') {
      const title = [];
      if (api.retain) {
        title.push(`retain=${api.retain}`);
      }
      if (api.qos) {
        title.push(`qos=${api.qos}`);
      }
      return [
        {
          type: 'code',
          lang: 'sh',
          meta: title.length > 0 ? `title="Publish topic: ${title.join(', ')}"` : `title="Publish topic"`,
          value: prettify(api.topic),
        },
        {
          type: 'code',
          lang: 'sh',
          meta: `title="Payload"`,
          value: prettify(api.payload || '<<empty>>'),
        }
      ];
    }
    return [
      {
        type: 'code',
        lang: 'sh',
        meta: `title="Subscribe: topic"`,
        value: prettify(api.topic),
      }
    ];
  }

  // default (no conversion)
  return [
    {
      type: 'code',
      lang: 'sh',
      meta: title ? `title="${title}"` : ``,
      value: convertToTedgeCLI(api),
    }
  ];
}

function collectCodeNodes(code, converters = [], formats = [], groupTabs = false) {
  const tabNodes = [];

  if (formats.length == 0) {
    formats.push('legacy');
  }

  const formatLabel = (name, format) => {
    if (formats.length > 1) {
      return `${name} (${format})`;
    }
    return name;
  };

  if (formats.length == 1 || !groupTabs) {
    // Option 1: Each convert and format are on separate tabs
    formats.forEach(format => {
      converters.forEach(converter => {
        const nodes = createCodeExample(code, converter, format);
        tabNodes.push([nodes, { label: formatLabel(converter, format), value: converter }]);
      });
    });
    return tabNodes;
  }

  // Option 2: Group the different formats of the same convert within the same tab
  // e.g. the 'mosquitto' tab will show both the legacy and new api examples
  converters.forEach(converter => {
    const nodes = [];
    formats.forEach(format => {

      // Special case for mqtt, the code block title is already used
      // so it needs an overall header
      if (converter == 'mqtt') {
        nodes.push({
          type: "jsx",
          value: `<p><strong>API version: ${format}</strong></p>`,
        });
      }

      // Add code
      nodes.push(...createCodeExample(code, converter, format, title=`API version: ${format}`));
    })
    tabNodes.push([nodes, { label: converter, value: converter }]);
  });
  return tabNodes;
}

function formatTabs(tabNodes, { groupId, labels, sync }) {
  function formatTabItem(nodes, meta) {
    const lang = nodes[0].lang;
    const label = meta.label ?? labels.get(lang);
    const value = meta.label?.toLowerCase() ?? lang;

    return [
      {
        type: "jsx",
        value: `<TabItem value="${value}"${label ? ` label="${label}"` : ""}>`,
      },
      ...nodes,
      {
        type: "jsx",
        value: "</TabItem>",
      },
    ];
  }

  return [
    {
      type: "jsx",
      value: `<Tabs${sync ? ` groupId="${groupId}"` : ""}>`,
    },
    ...tabNodes.map(([nodes, meta]) => formatTabItem(nodes, meta)),
    {
      type: "jsx",
      value: "</Tabs>",
    },
  ].flat();
}

const plugin = (options = {}) => {
  const { sync = true, groupId = 'te2mqtt', converters = ['tedge', 'mosquitto', 'mqtt'], formats = ['legacy', 'v1'], groupTabs = false } = options;
  return (root) => {
    let transformed = false;
    let includesImportTabs = false;

    visit(root, ['code', 'import'], (node, index, parent) => {
      if (is(node, 'import') && node.value.includes('@theme/Tabs')) {
        includesImportTabs = true;
        return;
      }

      if (is(node, 'code') && `${node.meta}`.includes('te2mqtt')) {
        const codeOptions = metaUtils.fromString(node.meta, {
          groupTabs,
        });

        let instanceFormats = formats;
        if (node.meta != 'te2mqtt') {
          if (codeOptions.formats) {
            instanceFormats = codeOptions.formats.split(',');
          }
        }

        const code = node.value;
        const codeBlocks = collectCodeNodes(code, converters, instanceFormats, codeOptions.groupTabs);
        const tabs = formatTabs(codeBlocks, {
          sync,
          groupId,
        });
        parent.children.splice(index, 1, ...tabs);
        transformed = true;
      }
    });

    if (transformed && !includesImportTabs) {
      root.children.unshift(...importNodes);
    }
  };
};

module.exports = plugin;
