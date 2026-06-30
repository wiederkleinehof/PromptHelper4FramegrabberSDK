# Basler Framegrabber SDK Prompt Generator

A fully static, client-side website that helps you compose high-quality prompts for large language models (LLMs) to generate robust Basler acquisition code.

The tool analyzes your application description locally in the browser, detects relevant technical topics, applies SDK routing rules, and assembles a structured prompt from reusable snippets.

## Features

- Live prompt preview (no server, no build step)
- SDK routing between **Basler Framegrabber SDK** and **Basler pylon SDK**
- Keyword-based topic detection with maintainable snippet rules
- Official Basler framegrabber and interface card product list
- UI languages: English, German, Korean, Simplified Chinese, Japanese, Vietnamese (with flag icons)
- Prompt language follows the selected UI language (localized via `prompt-bodies.js` and `prompt-locales-extra.js`)
- Per-camera scan type, pixel format, and image size; separate DMA count with per-DMA buffer settings
- Copy or download the generated prompt as `.txt`
- Form state and dismissed notices saved in **localStorage** (browser-only, no server)
- GitHub Pages ready: `.nojekyll`, static `404.html`, SVG favicon, skip link, noscript banner

## Local usage

1. Open `index.html` in any modern browser (double-click works).
2. Describe your application and configure hardware, interface, and options.
3. Copy or download the generated prompt and paste it into your preferred LLM.

No installation, npm, or internet connection is required at runtime.

## GitHub Pages deployment

1. Push this folder to a GitHub repository (repository root, `/docs`, or a dedicated `gh-pages` branch).
2. In the repository **Settings → Pages**, set the source to the branch and folder that contains these files.
3. GitHub Pages serves `index.html` as the site entry point.

**Project sites** (`https://<user>.github.io/<repo>/`) work out of the box: all asset paths are relative.

Included for Pages:

| File | Purpose |
|------|---------|
| `.nojekyll` | Disables Jekyll so files are served as-is |
| `404.html` | Simple not-found page with a link back to the generator |
| `favicon.svg` | Site icon (Basler blue) |

## Privacy

**All processing happens locally in your browser.** No input is sent to any server. There is no tracking and no external API calls at runtime.

Configuration is stored only in your browser’s **localStorage** until you reset the form or clear site data. Dismissed notice banners are remembered the same way.

## Confidentiality

Review every generated prompt before sharing it externally. Do not include confidential customer data, source code, credentials, serial numbers, license keys, or unpublished project details.

## SDK routing

The generator selects one of two routes:

### Basler Framegrabber SDK route

Used when:

- The selected hardware is a Basler **programmable** or **acquisition** framegrabber from the official product list, and
- The camera interface is **CXP-12**, **CXP-6**, **Camera Link**, or **CoaXPress-over-Fiber** on hardware that explicitly supports CoF (e.g. imaFlex 2 Dual 100).

Hardware classes:

- **Programmable framegrabbers** (imaFlex, marathon VCL / VCLx / VCX-QP): standard acquisition `.dll` applets (SingleArea, SingleLine, DualArea, DualLine, QuadArea, QuadLine) and custom VisualApplets `.hap` designs.
- **Acquisition framegrabbers** (imaWorx CXP-12 Quad, marathon ACL / ACX-QP): standard acquisition `.dll` applets only.

The prompt requests Framegrabber SDK code with DMA, applet handling, and rejects pylon-only answers when a real framegrabber is selected.

### Basler pylon SDK route

Used when:

- The selected hardware is a **Basler interface card** (CXP-12 Interface Card 1C, 2C, or 4C), or
- The camera interface is **GigE Vision**, **5GigE Vision**, **10GigE Vision**, **USB3 Vision**, or **Other**.

The prompt requests pylon SDK code with stream grabber and buffer concepts—not Framegrabber SDK DMA or applet handling unless genuinely supported.

## Working with existing acquisition code

If you already have code from another SDK or system, summarize what it does (buffers, triggers, DMA, events, timeouts, cleanup) rather than pasting confidential source. Paste that summary into the **Summary of existing acquisition workflow** field.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and form |
| `style.css` | Layout and visual design |
| `script.js` | Translations, routing, snippets, prompt logic, localStorage |
| `prompt-bodies.js` | Localized prompt body strings (EN/DE) |
| `prompt-locales-extra.js` | Prompt translations for KO/ZH/JA/VI |
| `404.html` | Static not-found page for GitHub Pages |
| `favicon.svg` | Site favicon |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll |
| `README.md` | This documentation |

## Extending snippet rules

Edit the `snippetRules` array in `script.js`. Each rule has an `id`, translation keys, `keywords`, and a `snippetKey` pointing to UI string entries.

## License

Use and adapt for internal Basler-related development workflows as needed.
