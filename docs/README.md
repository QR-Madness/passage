# Passage Documentation

This directory contains the Docusaurus documentation for Passage.

## Documentation Structure

The documentation follows a hierarchical numbering format:

- **intro.md** - Introduction and overview
- **0.0-developer-experience.md** - Developer Experience and project architecture
- **1.0-installation.md** - Installation guide
- **1.1-configuration.md** - Configuration guide
- **2.0-deployment.md** - Deployment guide
- **guides/** - Additional guides and how-tos
  - **keycloak-setup.md** - Keycloak configuration guide

## Running the Documentation

### Development Server

Start the development server with hot reload:

```bash
# Using Bun directly
bun run docs:start

# Using Taskfile
task docs:start
```

The site will be available at http://localhost:3000

### Build

Build the static site:

```bash
# Using Bun directly
bun run docs:build

# Using Taskfile
task docs:build
```

### Serve Built Site

Serve the built site locally:

```bash
# Using Bun directly
bun run docs:serve

# Using Taskfile
task docs:serve
```

### Clear Cache

Clear Docusaurus cache:

```bash
# Using Bun directly
bun run docs:clear

# Using Taskfile
task docs:clear
```

## Adding New Documentation

1. Create a new Markdown file in the `docs/` directory
2. Add frontmatter at the top:

```markdown
---
sidebar_position: X
title: Your Page Title
---

# Your Page Title

Content here...
```

3. Update `sidebars.ts` to include your new page in the navigation
4. Keep the numbering format: `X.Y-topic-name.md`

## Features

- **Mermaid Diagrams**: Supported natively (see 1.1-configuration.md for examples)
- **MDX Support**: Use React components in your Markdown
- **Search**: Built-in search functionality
- **Dark Mode**: Automatic dark/light theme switching
- **Responsive**: Mobile-friendly design

## Customization

- **Config**: Edit `docusaurus.config.ts` for site-wide settings
- **Sidebars**: Edit `sidebars.ts` for navigation structure
- **Styling**: Edit `src/css/custom.css` for custom styles
- **Logo**: Add your logo to `static/img/logo.svg`
