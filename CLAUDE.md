# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

vCard is a fully responsive personal portfolio website built with plain HTML, CSS, and vanilla JavaScript. There is no build step, no package manager, and no dependencies — it is a static site.

## Running & Developing

- **Run locally**: open `index.html` directly in a browser, or serve the folder over HTTP (e.g. `python -m http.server` or the VS Code "Live Server" extension). A server is preferred so relative `./assets/...` paths and the embedded Google Maps iframe resolve correctly.
- **No build, lint, or test commands exist.** Changes are made directly to the source files and verified by reloading the browser.

## Architecture

The entire site is a single page (`index.html`) with client-side "page" switching — there is no routing or multi-file navigation.

- **`index.html`** — all content for every section lives here as sibling `<article data-page="...">` elements (about, resume, portfolio, blog, contact). Only the article with the `active` class is visible; the rest are hidden via CSS.
- **`assets/css/style.css`** (~1900 lines) — single stylesheet. The top `:root` block defines all design tokens (color gradients, solid colors, `--fs-*` font sizes, `--fw-*` weights, transitions) as CSS custom properties. Reuse these variables rather than hardcoding values. Responsive layout is driven by `@media` breakpoints at the bottom of the file.
- **`assets/js/script.js`** — small vanilla JS file wiring up all interactivity. No framework.

### How the JS works (the key pattern)

All behavior is driven by `data-*` attributes selected with `document.querySelector("[data-...]")`. To add interactive elements, add the matching `data-*` attribute in the HTML and the existing JS loops will pick them up. The wired behaviors are:

- **Page navigation** (`[data-nav-link]` / `[data-page]`): clicking a nav button toggles the `active` class on the matching `<article>` by case-insensitive matching the button's text to the article's `data-page` value. *(Note: nav links and pages are matched by shared index `i`, so the order of nav buttons must stay aligned with the order of `[data-page]` articles.)*
- **Sidebar** (`[data-sidebar]` / `[data-sidebar-btn]`): mobile contact-info expand/collapse toggle.
- **Testimonials modal** (`[data-testimonials-item]`, `[data-modal-*]`, `[data-overlay]`): clicking a testimonial copies its avatar/title/text into the shared modal and opens it.
- **Portfolio filtering** (`[data-filter-btn]` desktop / `[data-select]` + `[data-select-item]` mobile dropdown): filters `[data-filter-item]` projects by their `data-category`. The category string must match the button/select text in **lowercase**. The "show all" case is a hardcoded string compared in `filterFunc` — the site is localized to Chinese, so this is `"全部"` (not `"all"`); keep the filter button text, the select item text, and this constant in sync if you change it.
- **Contact form** (`[data-form]`, `[data-form-input]`, `[data-form-btn]`): the submit button is enabled only when `form.checkValidity()` passes. The form has no backend submit handler.

## Conventions

- Match existing style: 2-space indent, semicolons, `const`/`let`, double quotes in JS. The CSS uses banner comments (`/*---*\ #SECTION \*---*/`) to delimit sections — keep that structure when adding styles.
- Visibility/state is expressed by toggling the `active` CSS class, not inline styles.
- `index.txt` is a plain-text content dump of the page and is not used at runtime.
