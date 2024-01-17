import { visit } from 'unist-util-visit';
import { is } from 'unist-util-is';
import {
  convertToMosquitto,
  prettify,
  parseTedgeCommand,
  convertToTedgeCLI,
} from '../tedge/index.js';
import metaUtils from '../meta/index.js';

const importNodes = {
  data: {
    estree: {
      body: [
        {
          source: {
            raw: "'@theme/Tabs'",
            type: 'Literal',
            value: '@theme/Tabs',
          },
          specifiers: [
            {
              local: { name: 'Tabs', type: 'Identifier' },
              type: 'ImportDefaultSpecifier',
            },
          ],
          type: 'ImportDeclaration',
        },
        {
          source: {
            raw: "'@theme/TabItem'",
            type: 'Literal',
            value: '@theme/TabItem',
          },
          specifiers: [
            {
              local: { name: 'TabItem', type: 'Identifier' },
              type: 'ImportDefaultSpecifier',
            },
          ],
          type: 'ImportDeclaration',
        },
      ],
      type: 'Program',
    },
  },
  type: 'mdxjsEsm',
  value:
    "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
};

function createCodeExample(code, converter, format = 'legacy', title = '') {
  const api = parseTedgeCommand(code, format, false);

  if (converter === 'mosquitto') {
    return [
      {
        type: 'code',
        lang: 'sh',
        meta: title ? `title="${title}"` : ``,
        value: convertToMosquitto(api),
      },
    ];
  }
  if (converter === 'mqtt') {
    if (api.action == 'pub') {
      const blockTitle = [];
      if (api.retain) {
        blockTitle.push(`retain=${api.retain}`);
      }
      if (api.qos) {
        blockTitle.push(`qos=${api.qos}`);
      }
      return [
        {
          type: 'code',
          lang: 'sh',
          meta:
            blockTitle.length > 0
              ? `title="Publish topic: ${blockTitle.join(', ')}"`
              : `title="Publish topic"`,
          value: prettify(api.topic),
        },
        {
          type: 'code',
          lang: 'sh',
          meta: `title="Payload"`,
          value: prettify(api.payload || '<<empty>>'),
        },
      ];
    }
    return [
      {
        type: 'code',
        lang: 'sh',
        meta: `title="Subscribe: topic"`,
        value: prettify(api.topic),
      },
    ];
  }

  // default (no conversion)
  return [
    {
      type: 'code',
      lang: 'sh',
      meta: title ? `title="${title}"` : ``,
      value: convertToTedgeCLI(api),
    },
  ];
}

function collectCodeNodes(
  code,
  converters = [],
  formats = [],
  groupTabs = false,
) {
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
    formats.forEach((format) => {
      converters.forEach((converter) => {
        const nodes = createCodeExample(code, converter, format);
        tabNodes.push([
          nodes,
          { label: formatLabel(converter, format), value: converter },
        ]);
      });
    });
    return tabNodes;
  }

  // Option 2: Group the different formats of the same convert within the same tab
  // e.g. the 'mosquitto' tab will show both the legacy and new api examples
  converters.forEach((converter) => {
    const nodes = [];
    formats.forEach((format) => {
      // Special case for mqtt, the code block title is already used
      // so it needs an overall header
      if (converter == 'mqtt') {
        nodes.push({
          type: 'paragraph',
          children: [
            {
              type: 'strong',
              children: [{ type: 'text', value: `API version: ${format}` }],
            },
          ],
        });
      }

      // Add code
      nodes.push(
        ...createCodeExample(code, converter, format, `API version: ${format}`),
      );
    });
    tabNodes.push([nodes, { label: converter, value: converter }]);
  });
  return tabNodes;
}

function formatTabs(tabNodes, { groupId, labels, sync }) {
  const children = tabNodes.map(([nodes, meta]) => {
    const lang = nodes[0].lang;
    const label = meta.label ?? labels.get(lang);
    const value = meta.label?.toLowerCase().replace(' ', '-') ?? lang;

    const attributes = [{ name: 'value', type: 'mdxJsxAttribute', value }];

    if (label != null) {
      attributes.push({ name: 'label', type: 'mdxJsxAttribute', value: label });
    }

    return {
      attributes,
      children: nodes,
      name: 'TabItem',
      type: 'mdxJsxFlowElement',
    };
  });

  const attributes = [];
  if (sync) {
    attributes.push({
      name: 'groupId',
      type: 'mdxJsxAttribute',
      value: groupId,
    });
  }
  // const children = tabNodes.map(([nodes, meta]) => formatTabItem(nodes, meta));
  return { attributes, children, name: 'Tabs', type: 'mdxJsxFlowElement' };
}

const plugin = (options = {}) => {
  const {
    sync = true,
    groupId = 'te2mqtt',
    converters = ['tedge', 'mosquitto', 'mqtt'],
    formats = ['legacy', 'v1'],
    groupTabs = false,
  } = options;
  return (root) => {
    let transformed = false;
    let includesImportTabs = false;

    visit(root, ['code', 'mdxjsEsm'], (node, index, parent) => {
      if (is(node, 'mdxjsEsm') && node.value.includes('@theme/Tabs')) {
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
        const codeBlocks = collectCodeNodes(
          code,
          converters,
          instanceFormats,
          codeOptions.groupTabs,
        );
        const tabs = formatTabs(codeBlocks, {
          sync,
          groupId,
        });
        parent.children.splice(index, 1, tabs);
        transformed = true;
      }
    });

    if (transformed && !includesImportTabs) {
      root.children.unshift(importNodes);
    }
  };
};

export default plugin;
