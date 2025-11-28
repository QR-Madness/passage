---
sidebar_position: 1
title: Introduction
---

# Passage

An open-source, composable authentication framework project providing secure OAuth/OIDC integrations,
designed as a reusable backbone for enterprise-grade applications.

> ⚠️ **WARNING**: This project is currently a prototype template under construction and is not fit for production, or
> general usage, yet.

Once we are production-ready, we'll keep development consistent, and most importantly, non-intrusive to your changes.

## Why Passage?

- Organizations have **identity sprawl**: Auth0 for customers, Okta for employees, custom solutions for partners
- No clean way to present a unified identity interface to internal applications
- Each identity provider has different APIs, token formats, user schemas
- Applications end up with brittle multi-provider integration logic
- Migration between providers is organizationally traumatic

## Conceptual Architecture

![Conceptual Architectural Diagram](/img/conceptual-architectural-diagram.png)

## Developer Tools

We aim to make this project as easy to use as possible, loading-up on secure and powerful developer tools:

- **Git** - Version control
- **Docker** - Containerization
- **Bun** - Blazing fast package manager and runtime (https://bun.com/)
- **Taskfile** - A modernized GNU-make (check out [Taskfile.dist.yml](../Taskfile.dist.yml))

## Timeline of Development

![Timeline](/img/timeline.png)

## Next Steps

Continue to the [Developer Experience](./0.0-developer-experience.md) section to understand the project architecture and structure.
