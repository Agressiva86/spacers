# Spacers

Marketing site for Spacers — UI/UX, Astro, and performance-focused digital products.

Static HTML. No build step, no backend, no environment secrets.

## Preview locally

Serve the project folder over HTTP (opening `index.html` as a file can break fonts and assets).

**Laragon:** [http://localhost/spacers/](http://localhost/spacers/)

**Node:**

```bash
npx serve .
```

**Python:**

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Stack

- HTML / CSS
- [Tailwind CSS](https://tailwindcss.com) via CDN
- [GSAP](https://gsap.com) 3.12 + ScrollTrigger

## Deploy

Any static host works: GitHub Pages, Netlify, Cloudflare Pages, or a classic web root.

For GitHub Pages: repository **Settings → Pages → Deploy from a branch**, branch `main`, folder `/` (root).

## License

© Spacers. All rights reserved. Source is published for deployment, not as an open-source product.
