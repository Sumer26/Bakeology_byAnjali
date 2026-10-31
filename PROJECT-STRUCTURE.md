# Bakeology

## Editing

- Page content: src/pages/*.html
- Shared header and footer: src/partials/
- Shared document layout: src/layout.html
- Stylesheets: css/
- Browser JavaScript modules: js/
- Cake catalog: js/data/catalog.js
- Flavours and prices: js/data/menu.js
- Business phone and cake options: js/config.js
- Cake drawing: js/cake-renderer.js
- Customizer controls and saved designs: js/customizer.js

After HTML/template edits, run:

python3 build.py

CSS and JavaScript edits require no build.

## Preview

python3 -m http.server 8000

Then open http://localhost:8000.

Use an HTTP server rather than double-clicking HTML:
JavaScript modules require HTTP.

## Publishing

Commit the five generated root HTML pages, src/, css/, js/,
build.py and the existing assets/ directory for GitHub Pages.

Old root scripts and styles are retained for reference,
but the new pages do not load them.

Backups are excluded from git.
Existing cake photographs remain in assets/.

No API keys, backend or npm installation are required.
