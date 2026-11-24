# Mind & Culture Lab

Open companion site for the [Mind & Culture Lab](https://www.mindandculturelab.com/) at Duke University — datasets, interactive explorers, 3D task walkthroughs, and field sites.

**Live:** [mindandculturelab.github.io](https://mindandculturelab.github.io/)

## Preview locally

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/`.

## Site map

| Path | Purpose |
|---|---|
| `/` | Homepage — brand, featured studies, about, contact |
| `/data/` | Browse open data by researcher, topic, or study |
| `/experience/` | Interactive 3D task procedures |
| `/sites/` | Field-site globe |
| `/studies/` | Study index and individual study pages |

## Edit checklist

1. `site-config.js` — public site URL
2. `index.html` — homepage copy and featured studies
3. `data/studies.json` / `data/sites.json` — catalogs for explorers and the globe
4. `studies/<id>/` — study page, files, and optional `data/` explorer
5. `sitemap.xml` — keep in sync when adding public pages

## Shared chrome

Header and footer markup is generated from one script so nav links stay consistent:

```bash
python3 scripts/sync-site-chrome.py
```

Run that after changing shared navigation or when adding a new HTML page that should use the standard chrome.

## Stack

Static HTML, CSS, and vanilla JS on GitHub Pages. Three.js powers the globe and 3D procedures. No build step is required to publish.

## License

MIT.
