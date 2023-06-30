// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const fs = require('fs');
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const docsDir = process.env.DOCS_DIR || 'docs';
const domain = process.env.DOMAIN || 'https://thin-edge.github.io';
const baseUrl = process.env.BASE_URL || '/';

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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
           // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false, // Optional: disable the blog plugin
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    // function (context, options) {
    //   return {
    //     name: 'webpack-configuration-plugin',
    //     configureWebpack(config, isServer, utils) {
    //       return {
    //         resolve: {
    //           symlinks: false,
    //         }
    //       };
    //     }
    //   };
    // },
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
            href: 'https://github.com/thin-edge/thin-edge.io',
            label: 'GitHub',
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
                label: 'Twitter',
                href: 'https://twitter.com/thin_edge_io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Software AG.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
