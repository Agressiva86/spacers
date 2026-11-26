# Spacers

Marketing site for Spacers — UI/UX, Astro, and performance-focused digital products.

Built with [Astro](https://astro.build) 7.x, Tailwind CSS 4, and GSAP.

## Requirements

- Node.js 22.12 or newer

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build & preview

```bash
npm run build
npm run preview
```

Static output is written to `dist/`.

## Project layout

| Path | Purpose |
|------|---------|
| `src/pages/` | Routes (`/`, `/brief`) — compose components only |
| `src/layouts/` | Page shells, meta, fonts |
| `src/components/home/` | Home sections (hero, services, process, portfolio, footer) |
| `src/components/brief/` | Brief intro, form sections, success state |
| `src/components/shared/` | Shared UI (preloader) |
| `src/styles/` | Tailwind entry + page CSS |
| `src/scripts/` | Client JS (GSAP, forms, preloader) |
| `public/assets/` | Images, video, favicons |

## Deploy

Deploy the `dist/` folder to any static host (Netlify, Cloudflare Pages, Vercel static, GitHub Pages with an Astro adapter, or a classic web root).

## License

© Spacers. All rights reserved. Source is published for deployment, not as an open-source product.