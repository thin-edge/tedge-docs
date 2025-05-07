// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import fs from 'fs';
import { themes } from 'prism-react-renderer';
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

import remarkCmdRun from './remark/cmd-run/index.js';
import remarkMqttCodeBlock from './remark/mqtt-codeblock/index.js';
import tabBlocks from 'docusaurus-remark-plugin-tab-blocks';

const docsDir = process.env.DOCS_DIR || 'docs';
const domain = process.env.DOMAIN || 'https://thin-edge.github.io';
const baseUrl = process.env.BASE_URL || '/thin-edge.io/';
const includeCurrentVersion = process.env.INCLUDE_CURRENT_VERSION || 'true';

const substitutePlaceholders = (value, { bold = false } = {}) => {
  if (bold) {
    return value.replaceAll('%%te%%', '**thin-edge.io**');
  }
  return value.replaceAll('%%te%%', 'thin-edge.io');
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Thin-edge',
  tagline: 'The open edge framework for lightweight IoT devices',
  favicon: 'img/favicon.ico',
  future: {
    // Use new Rust based packaging tools like Rspack
    // https://docusaurus.io/blog/releases/3.6
    experimental_faster: true,
  },
  markdown: {
    mermaid: true,
    // Use preprocessor to replace global variables
    preprocessor: ({ filePath, fileContent }) => {
      return substitutePlaceholders(fileContent, { bold: true });
    },
    parseFrontMatter: async (params) => {
      // Reuse the default parser
      const result = await params.defaultParseFrontMatter(params);

      // Replace text placeholders
      if (result.frontMatter.description) {
        result.frontMatter.description = substitutePlaceholders(
          result.frontMatter.description,
          { bold: false },
        );
      }
      return result;
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  // Set the production url of your site here
  url: domain,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl,

  // Normalize trailing slashes
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'thin-edge', // Usually your GitHub org/user name.
  projectName: 'thin-edge', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Ignore until links have been fixed, as broken anchors were only
  // checked from docusaurus 3.1 onwards
  // onBrokenAnchors: 'log',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  clientModules: [],
  headTags: [
    // Add permissions-policy to prevent chrome warnings
    // Example: Error with Permissions-Policy header: Origin trial controlled feature not enabled: 'interest-cohort'.
    // https://github.com/orgs/community/discussions/52356
    {
      tagName: 'meta',
      attributes: {
        'http-equiv': 'Permissions-Policy',
        content: 'interest-cohort=()',
      },
    },
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // Serve the docs at the site's root
          sidebarPath: require.resolve('./sidebars.js'),
          // Resolve the symlink to prevent any webpack caching problems
          // https://github.com/facebook/docusaurus/issues/3272#issuecomment-879295056
          path: fs.realpathSync(docsDir),
          // Should the unreleased docs be published
          includeCurrentVersion: includeCurrentVersion === 'true',
          // Enable "edit this page" links for only the current/next version
          editUrl: ({ version, docPath }) =>
            version == 'current'
              ? `https://github.com/thin-edge/thin-edge.io/edit/main/docs/src/${docPath}`
              : undefined,
          beforeDefaultRemarkPlugins: [
            [
              remarkCmdRun,
              { showErrors: false, strict: false, logErrors: false },
            ],
          ],
          remarkPlugins: [
            [
              remarkMqttCodeBlock,
              {
                sync: true,
                converters: ['tedge', 'mosquitto', 'mqtt'],
                formats: ['legacy'],
                // Enable both v1 and legacy examples in code blocks
                // formats: ['v1', 'legacy'],

                // Group the formats together in the same tabs
                // e.g. if using 'v1' and 'legacy' formats, both will appear under the 'tedge'
                // table if grouping is enabled
                groupTabs: true,
              },
            ],
            tabBlocks,
          ],
        },
        blog: false, // Optional: disable the blog plugin
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    // @ts-ignore
    async function redirectInitialRequestToPathWithTrailingSlash(
      context,
      options,
    ) {
      return {
        name: 'plugin-redirect-trailing-slash',
        configureWebpack(_config, _isServer, _utils) {
          return {
            devServer: {
              setupMiddlewares(middlewares, _devServer) {
                middlewares.unshift({
                  name: 'redirect-trailing-slash',
                  middleware: (req, res, next) => {
                    // We need to add a prefix to the path to do URL manipulation
                    let url = new URL(`https://example.com${req.url}`);
                    if (
                      url.pathname.length > 0 &&
                      !url.pathname.endsWith('/')
                    ) {
                      // Manipulate just the path to preserve stuff after the path (like # or ?)
                      url.pathname += '/';
                      res.redirect(
                        302,
                        url.toString().slice('https://example.com'.length),
                      );
                    } else {
                      next();
                    }
                  },
                });
                return middlewares;
              },
            },
          };
        },
      };
    },
    'plugin-image-zoom',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/',
            from: ['/html/'],
          },
        ],
        createRedirects(existingPath) {
          if (existingPath.includes('/html/')) {
            // Redirect from /html/team/X to /docs
            return [existingPath.replace('/html/', '/')];
          }
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      announcementBar: {
        id: 'official-1.0.0-release',
        content:
          'thin-edge.io has reached 1.0.0 🚀 Install thin-edge.io for production grade device management on your edge device',
      },
      // Replace with your project's social card
      navbar: {
        title: 'documentation',
        logo: {
          alt: 'thin-edge.io',
          src: 'img/thin-edge-logo.svg',
          // Use separate dark-mode logo as is more cross compatible
          // in different browsers (chrome and safari)
          srcDark: 'img/thin-edge-logo-dark.svg',
        },
        items: [
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownItemsAfter: [],
            dropdownActiveClassDisabled: true,
          },
          {
            href: 'https://github.com/thin-edge/thin-edge.io',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Github',
                href: 'https://github.com/thin-edge/thin-edge.io',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@thin_edge_io/featured',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/thin_edge_io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cumulocity GmbH.`,
      },
      metadata: [
        {
          name: 'keywords',
          content: 'iot, edge, cumulocity-iot, azure-iot, aws-iot, iot-devices',
        },
      ],
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'json5', 'log', 'toml', 'python'],
      },
      algolia: {
        appId: 'VJGN4W1RS0',
        apiKey: '090e96d679061a08763f67008de705c6',
        indexName: 'thin-edge-io',
        contextualSearch: true,
        searchParameters: {},
      },
      imageZoom: {
        // Allow disabling image zoom on specific images
        // by surrounding them in `_![image](image.png)_` or <em></em>
        selector: '.markdown :not(em) > img',
      },
    }),
};

module.exports = config;
