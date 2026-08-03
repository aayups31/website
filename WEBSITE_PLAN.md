# Aayu Pratap Singh — Website Production Plan

**Updated:** August 2, 2026
**Sources:** private `portfolio.md`, private résumé PDF, and owner-supplied image library

## 1. Product decision

The site is a dual-layer portfolio:

1. A cinematic homepage built from full-screen image worlds, scroll-linked motion, and editorial typography.
2. Fast semantic routes for experience, projects, case studies, about, archive, résumé, and contact.

The motion layer is decorative. Every claim, link, heading, and action exists in normal HTML and remains usable with JavaScript motion disabled, reduced motion enabled, or images unavailable.

The original procedural-room direction has been retired. Supplied photography now provides the visual truth; code provides pacing, depth, masks, transitions, light, grain, and typography.

## 2. Positioning

Aayu Pratap Singh is a University of Waterloo Computer Science student, founder, and engineer working across full-stack products, machine learning, infrastructure, simulation, and creative technology.

The site must quickly answer:

- Who is Aayu?
- What has he built or owned?
- What evidence supports each claim?
- What visual and cultural influences shape his taste?
- How can a visitor inspect projects, view the résumé, or make contact?

Use Aayu's real name throughout. Do not introduce a creative alias.

## 3. Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Cinematic chapter-based overview |
| `/experience` | Semantic professional timeline |
| `/projects` | Selected-project index |
| `/projects/[slug]` | Evidence-led project case studies |
| `/about` | Biography, values, interests, and education |
| `/archive` | VFX and photography shell with honest placeholders |
| `/resume` | Accessible HTML résumé |
| `/contact` | Email, GitHub, résumé, and location |

Persistent homepage controls include primary navigation, chapter progress, motion preference, opt-in sound, résumé, and contact.

## 4. Cinematic chapter map

### Prologue — Identity

**Visual material:** Stamford Bridge aerial and stadium bowl.
**Purpose:** Establish Aayu's name, location, positioning, and two immediate paths into the work.
**Motion:** Slow aerial push, masked bowl reveal, faint large-format name typography.

### World 1 — Performance

**Visual material:** Chelsea match-night atmosphere, stadium bowl, locker room, and pitch-level detail.
**Content:** UniMarket, SportsNext, and ATS experience.
**Narrative:** What happens under pressure is built backstage.
**Motion:** Empty scale to preparation to match intensity; foreground and background move at different depths.

This is a personal football metaphor, not a claim of club employment or affiliation.

### World 2 — Precision

**Visual material:** Ferrari studio, garage, overhead cornering, and on-track images.
**Content:** F1 Strategy Engine, AI Personal Finance Manager, and Emotion-Powered Music Mixer.
**Narrative:** Complex signals matter when they change the next decision.
**Motion:** Studio stillness to garage pressure to diagonal track velocity.

### World 3 — Music

**Artists:** Linkin Park, Hans Zimmer, and Michael Jackson.
**Narrative:** Three different lessons in pressure, architecture, scale, rhythm, and control.
**Motion:** Three individually timed image movements:

- Linkin Park — distressed graphic texture and band imagery
- Hans Zimmer — architectural concert scale and orchestral light
- Michael Jackson — isolated stage silhouette and precise portrait framing

Do not reproduce lyrics or imply artist endorsement. The copy describes Aayu's listening influences only.

### World 4 — Image

**Visual material:** Supplied automotive motion studies.
**Content:** VFX and photography archive structure.
**Narrative:** The image is another system—light, timing, motion, and context.
**Motion:** Full-bleed drift base with feathered portrait/detail layers; never a tiled card gallery.

Current material demonstrates layout and motion only. It is not presented as Aayu's finished photography or VFX work. Final work must include role, caption, date, credits, process, and permission.

### Finale — Signal open

The imagery falls toward near-black. Oversized typography and direct contact actions become dominant.

## 5. Visual rules

- No card grid on the cinematic homepage.
- No bordered glass panels, dashboard chrome, or rounded containers around chapter copy.
- Images occupy the viewport and enter through gradients, soft masks, asymmetric crops, and elliptical apertures.
- Typography uses large low-weight forms, severe line-height, small technical labels, and occasional warm-gold accents.
- IBM Plex Sans and Bodoni Moda remain the core pairing; hierarchy and composition create the cinematic character.
- Grain and scan texture stay subtle and are reduced on lower-quality devices.
- Text contrast comes from localized light falloff and image grading, not opaque boxes.

## 6. Motion architecture

The fixed DOM stage mounts the active world and its immediate neighbors. Scroll handling:

1. Finds the semantic chapter crossing a viewport focus line.
2. Updates the active world only when the chapter changes.
3. Damps local progress and velocity with `requestAnimationFrame`.
4. Writes CSS custom properties directly to the stage.
5. Uses those properties for GPU-friendly transforms, opacity, and chapter-specific image timing.

No React state is updated per animation frame. There is no homepage canvas or WebGL dependency.

Quality behavior:

- High/medium: base, middle, near, and selected detail layers
- Low/mobile: base and essential story layers; optional details are not mounted
- Reduced motion: static transforms, immediate state updates, no grain animation

Sound remains opt-in and uses a restrained procedural tone; no copyrighted recordings are bundled.

## 7. Content safeguards

- Résumé facts govern education, dates, roles, technologies, and impact claims.
- Ongoing work is marked **In progress**.
- UniMarket is not described as University of Waterloo-endorsed.
- ATS details remain outcome-focused and must respect confidentiality.
- Finance features are educational/prototypical, not financial advice.
- Emotion-recognition demos must document consent and data handling.
- VFX and photography work must not invent clients, titles, credits, or outcomes.
- Private phone information stays out of the public site.

## 8. Asset and rights gate

The current photographic assets are owner-supplied references with undocumented origins. They are valid for private prototyping, not automatically cleared for public production.

Before launch, every final image must have:

- source and creator
- license or written permission
- allowed web/commercial scope
- required credit language
- confirmation for visible trademarks, artist likenesses, album art, and watermarks

The current status is recorded in `ASSET_LICENSES.md`.

## 9. Accessibility and performance gates

- Semantic reading order matches the visual narrative.
- Decorative images use empty alternative text and remain hidden from assistive technology.
- Keyboard navigation, skip link, focus states, menu focus containment, and Escape behavior work.
- Motion preference persists locally and respects system reduced-motion settings.
- Sound begins only after explicit interaction.
- No horizontal overflow at desktop or phone sizes.
- Initial code stays close to the semantic-site budget; chapter imagery loads progressively.
- Missing media never blocks the underlying portfolio content.

## 10. Verification and next production session

Required checks for each release:

1. Lint, TypeScript, and content tests
2. Production build
3. Desktop and mobile browser tests
4. Console, request-failure, and missing-image audit
5. Screenshots at every chapter and artist beat
6. Reduced-motion, overflow, and keyboard checks
7. Asset-rights ledger review

When final VFX and photography media arrive, replace the corresponding files and content records, add credits and breakdown metadata, tune crops at desktop/mobile, and rerun the full verification sequence. The motion architecture should not require redesign.
