# Aayu Pratap Singh — cinematic portfolio

A content-first personal portfolio progressively enhanced with scroll-directed, image-led cinematic worlds.

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

- Semantic content never depends on the decorative motion layer.
- Sound is opt-in and reduced motion is respected.
- Full-screen 2.5D compositions use supplied stills, soft masks, parallax, and editorial type instead of modelled placeholder rooms.
- Only the active chapter and its neighboring image worlds are mounted at once.
- Supplied reference images are tracked in the rights ledger and remain provisional until publication rights are confirmed.
- VFX and photography areas are structured so final credited work can replace the current studies without redesigning the world.

See `WEBSITE_PLAN.md` for the full production roadmap and `ASSET_LICENSES.md` for the rights ledger.
