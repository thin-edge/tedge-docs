// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const fs = require('fs');
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const remarkCmdRun = require('./src/remark/cmd-run');
const remarkMqttCodeBlock = require('./src/remark/mqtt-codeblock');

const docsDir = process.env.DOCS_DIR || 'docs';
const domain = process.env.DOMAIN || 'https://thin-edge.github.io';
const baseUrl = process.env.BASE_URL || '/';
const includeCurrentVersion = process.env.INCLUDE_CURRENT_VERSION || 'true';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Thin-edge',
  tagline: 'The open edge framework for lightweight IoT devices',
  favicon: 'img/favicon.ico',
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  // Set the production url of your site here
  url: domain,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'thin-edge', // Usually your GitHub org/user name.
  projectName: 'thin-edge', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

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
          includeCurrentVersion: includeCurrentVersion === "true",
          // Enable "edit this page" links for only the current/next version
          editUrl: ({
            version,
            docPath,
          }) => version == 'current' ? `https://github.com/thin-edge/thin-edge.io/edit/main/docs/src/${docPath}` : undefined,
          beforeDefaultRemarkPlugins: [
            [remarkCmdRun, {showErrors: false, strict: false}],
          ],
          remarkPlugins: [
            [
              remarkMqttCodeBlock,
              {
                sync: true,
                converters: ['tedge', 'mosquitto', 'mqtt'],
              }
            ],
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
    'plugin-image-zoom',
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: true,
        indexBlog: false,
      }
    ],
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
            return [
              existingPath.replace('/html/', '/'),
            ];
          }
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      navbar: {
        title: 'documentation',
        logo: {
          alt: 'thin-edge.io',
          src: 'img/thin-edge-logo.svg',
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
            className: "header-github-link",
            'aria-label': "GitHub repository",
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
        copyright: `Copyright © ${new Date().getFullYear()} Software AG.`,
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
        additionalLanguages: [
          'bash',
          'log',
          'toml',
          'python',
        ],
      },
    }),
};

module.exports = config;
