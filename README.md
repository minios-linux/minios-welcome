# minios-welcome

MiniOS Welcome is a self-contained local page shown by supported browsers on first run.
The visible welcome pages are prebuilt HTML/CSS with no third-party web libraries. A tiny
launcher in `html/index.html` selects the best language from the browser locale. The small
`html/js/welcome.js` controller starts the presentation transitions and Mio's local animation
states after the page has loaded.

Translations are managed by the global `minios-welcome` target in the root `lokit.yaml`.
English source strings live in `html/i18n/en.json`; Lokit maintains the other JSON catalogs.
Stable translation IDs are independent of the English wording.

Mio runtime assets live in `html/assets/mio/` as compact VP9 WebM files with alpha. Raw MP4
animation sources may be kept in `mio/` for authoring and are excluded from Debian source
packages; they are not required to build or install the welcome page.

After the one-shot intro, Mio randomly plays one to three idle clips before another support
request. Idle clips do not repeat immediately, and requests continue until a support CTA is
used. Idle clips occasionally show contextual randomized banter or useful tips about the
community chat, online documentation, project promotion, and bug reporting. Request states
also choose from multiple localized lines. After support is used, Mio shows the success
reaction, stops direct requests, and keeps cycling through idle animations with occasional tips.

Build the localized pages with:

```sh
make build
```

Check the generated pages and run the tests with:

```sh
make test
```
