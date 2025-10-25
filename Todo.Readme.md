# Intro
An open-source, composable authentication framework project providing secure OAuth/OIDC integrations, 
designed as a reusable backbone for enterprise-grade applications.

Uses the Bun as a package manager and runtime for blazing fast speeds, especially for Express.js (https://bun.com/).

```
┌─────────────────────────────────────────┐
│   Downstream Applications               │
│   (consume your unified OIDC interface) │
└──────────────┬──────────────────────────┘
               │ OAuth2/OIDC
┌──────────────▼──────────────────────────┐
│   Your Identity Gateway                 │
│   ├─ Authorization Server               │
│   ├─ Token Translation Engine           │
│   ├─ Account Linking Service            │
│   ├─ User Pool Federation Manager       │
│   └─ Session Management                 │
└──────────────┬──────────────────────────┘
               │ Multiple protocols
┌──────────┼──────────┬───────────┐
▼          ▼          ▼           ▼
┌───────┐ ┌───────┐ ┌────────┐ ┌─────────┐
│Auth0  │ │Okta   │ │Azure AD│ │Custom   │
│(OIDC) │ │(OIDC) │ │(SAML)  │ │(OAuth2) │
└───────┘ └───────┘ └────────┘ └─────────┘
```

**Why would you want to use O2IP?**
- Organizations have **identity sprawl**: Auth0 for customers, Okta for employees, custom solutions for partners
- No clean way to present a unified identity interface to internal applications
- Each identity provider has different APIs, token formats, user schemas
- Applications end up with brittle multi-provider integration logic
- Migration between providers is organizationally traumatic

## Use Git to superpower your development!

We aim to make this project as easy to use as possible.
Once we are production-ready, we'll keep development consistent, and most importantly, non-intrusive to your changes.

> ⚠️ **WARNING**: This project is currently a prototype template under construction and is not fit for production, or general usage, yet.

## Readme Directory

This readme is only an introductory overview of what O2IP does.
Setup, technical docs, and diagrams can be found in the [readme](./readme) directory.

