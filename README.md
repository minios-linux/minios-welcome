# minios-welcome

The Debian package contains the welcome page's minified runtime assets only.
The unminified JavaScript, CSS, and SCSS files remain in the source tree for
maintenance.

Translations are managed by the global `minios-welcome` target in the root
`lokit.yaml`. The `build` and `clean` targets synchronize translatable text in
`html/index.html` directly with `html/js/translations/en.js`. Run Lokit after
changing the English text to update the other language catalogs.

Check synchronization without modifying the catalog:

```sh
tools/html-i10n-extract --check
```

Rebuild the JavaScript bundle after changing `html/js/plugins.js` or
`html/js/slides.js`:

```sh
tools/build-slides-js
```

The build helper requires `terser`.
