import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: '0.0 Developer Experience',
      items: [
        '0.0-developer-experience',
      ],
    },
    {
      type: 'category',
      label: '1.0 Installation & Configuration',
      items: [
        '1.0-installation',
        '1.1-configuration',
      ],
    },
    {
      type: 'category',
      label: '2.0 Deployment',
      items: [
        '2.0-deployment',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/keycloak-setup',
      ],
    },
  ],
};

export default sidebars;
