import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Mermaid theme configuration
const lightTheme = {
    theme: 'base', themeVariables: {
        primaryColor: '#e6f3ff',
        primaryTextColor: '#1a1a1a',
        primaryBorderColor: '#2e8555',
        lineColor: '#2e8555',
        secondaryColor: '#f0f0f0',
        tertiaryColor: '#fff',
    },
};

const config: Config = {
    title: 'Passage', tagline: 'High-Security OAuth2/OIDC Authentication Platform', favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://your-docusaurus-site.example.com', // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl: '/',
    staticDirectories: ["docs/static"],

    // GitHub pages deployment config.
    organizationName: 'your-org', projectName: 'passage',

    onBrokenLinks: 'throw', markdown: {
        format: 'mdx', mermaid: true, preprocessor: ({filePath, fileContent}) => {
            return fileContent;
        }, hooks: {
            onBrokenMarkdownLinks: 'warn',
        },
    },

    i18n: {
        defaultLocale: 'en', locales: ['en'],
    },

    presets: [['classic', {
        docs: {
            routeBasePath: '/',
            sidebarPath: './docs/sidebars.ts',
            editUrl: 'https://github.com/your-org/passage/tree/master/',
        }, blog: false, theme: {
            customCss: './src/css/custom.css',
        },
    } satisfies Preset.Options,],],

    themeConfig: {
        image: 'img/passage-social-card.jpg', navbar: {
            title: 'Passage', logo: {
                alt: 'Passage Logo', src: 'img/logo.svg', href: '/intro',
            }, items: [{
                type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Documentation',
            }, {
                href: 'https://github.com/your-org/passage', label: 'GitHub', position: 'right',
            },],
        }, footer: {
            style: 'dark', links: [{
                title: 'Docs', items: [{
                    label: 'Documentation', to: '/intro',
                },],
            }, {
                title: 'More', items: [{
                    label: 'GitHub', href: 'https://github.com/your-org/passage',
                },],
            },], copyright: `Copyright © ${new Date().getFullYear()} Passage. Built with Docusaurus.`,
        }, prism: {
            theme: prismThemes.github, darkTheme: prismThemes.dracula,
        }, mermaid: {
            theme: {light: 'neutral', dark: 'dark'},
        },
    } satisfies Preset.ThemeConfig, themes: ['@docusaurus/theme-mermaid'],
};

export default config;
