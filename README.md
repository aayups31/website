# Aayu Pratap Singh — cinematic portfolio

A content-first personal portfolio progressively enhanced with a scroll-directed real-time 3D experience.

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

Set `NEXT_PUBLIC_SITE_URL` to the final production origin before deployment so
canonical URLs, the sitemap, and the robots file point at the live domain.

## Experience principles

- Semantic content never depends on WebGL.
- Sound is opt-in and reduced motion is respected.
- The cinematic canvas is loaded through a client-only boundary.
- Scene content is built from original procedural geometry until licensed production assets are ready.
- VFX and photography areas intentionally contain labeled placeholders that can be replaced without redesigning the world.

See `WEBSITE_PLAN.md` for the full production roadmap and `ASSET_LICENSES.md` for the rights ledger.
