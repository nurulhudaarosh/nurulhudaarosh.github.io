# Portfolio — MD. Nurul Huda

Personal portfolio website. Live at **https://nurulhudaarosh.github.io/**

## Features

- Editorial design (Fraunces / Bricolage Grotesque / JetBrains Mono / Caveat) with light & dark mode that follows the system setting
- Animated three.js dot-terrain background (reacts to the mouse, follows the theme) and a subtle paper grain
- **3D book view**: the whole portfolio as a book with 3D page turns, bookmark ribbons for each section, a contents page and keyboard/swipe navigation
- Rotating quotes in their original language (Arabic with Bangla translation, Bangla poets, Greek, Chinese, French and English with translations) and sources
- Preferences are remembered and shareable via URL, e.g. `?view=3d&theme=dark`
- Sections: About & education, experience timeline, achievements, filterable projects, skill cards with logos, contact — each with its own colour
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
