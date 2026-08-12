# Aayu Pratap Singh — automotive portfolio

A content-first personal portfolio built as one scroll-directed automotive film. A persistent visual stage moves through original Senna-inspired, Formula, and Skyline plates while semantic HTML carries Aayu's real experience, projects, creative practice, and contact details.

## Run locally

Use Node.js 22.13 or newer (the repository includes an `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Commands

- `npm run dev` — local development server
- `npm run lint` — lint the project
- `npm run typecheck` — TypeScript verification
- `npm run test` — unit tests
- `npm run test:e2e` — desktop and mobile browser tests
- `npm run build` — production build
- `npm run check` — full verification pipeline
- `node scripts/prepare-vehicle-assets.mjs` — regenerate optimized WebP plates (Node 22.13+)

Set `NEXT_PUBLIC_SITE_URL` to the final production origin before deployment so
canonical URLs, the sitemap, and the robots file point at the live domain.

## Experience principles

- Vehicle, camera, masks, and text share one reversible GSAP master timeline.
- Lenis runs through the GSAP ticker, avoiding competing scroll animation loops.
- Text is clean system sans plus technical mono, with masked scroll reveals and no hover distortion.
- Deferred Formula, Skyline, and creative media load shortly before each chapter.
- Reduced motion is a purpose-built six-panel editorial edit rather than an empty or frozen film.
- The owner-supplied `Images/` directory is reference-only, ignored by Git, and never requested by the site.
- Original temporary plates are processed into 3840px desktop and 2160px mobile WebPs with a deterministic manifest.
- VFX and photography areas are structured so final credited work can replace the current studies without redesigning the world.

See `docs/AUTOMOTIVE_PRODUCTION_PLAN.md` for the current production roadmap and `ASSET_LICENSES.md` for the rights ledger. `WEBSITE_PLAN.md` is retained as the superseded pre-automotive plan for history.
