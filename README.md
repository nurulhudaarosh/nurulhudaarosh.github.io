# Portfolio — MD. Nurul Huda

Personal portfolio website. Live at **https://nurulhudaarosh.github.io/**

## Features

- Editorial design (Fraunces / Bricolage Grotesque / JetBrains Mono / Caveat) with light & dark mode that follows the system setting
- **English / বাংলা** language toggle (Tiro Bangla, Hind Siliguri, Galada) with Bangla digits
- **2D / 3D view**: 3D adds a perspective floor, tilting cards with glare, 3D scroll entrances and a draggable skills sphere
- Rotating quotes (Quran, Hadith, poets, writers, philosophers) with sources and Arabic originals
- Preferences are remembered and shareable via URL, e.g. `?lang=bn&view=3d&theme=dark`
- Sections: About & education, experience & leadership, achievements, filterable projects, skills, contact
- Interactive terminal (`help`, `projects`, `cv`, …) with history (↑/↓) and Tab autocomplete
- Contact form opens a prefilled email draft (no backend needed)
- SEO: structured data (JSON-LD), Open Graph preview image, sitemap and robots.txt
- Google Analytics with CV download, outbound link and contact click events
- Accessible: semantic HTML, keyboard focus styles, skip link, reduced-motion support
- Fully responsive, no build step — pure HTML/CSS/JS

## Preview locally

```bash
python3 -m http.server 8000
```

## Deploy

Push to `main` → GitHub Actions deploys to GitHub Pages at https://nurulhudaarosh.github.io/.
