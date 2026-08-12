# Automotive Portfolio Production Plan

**Status:** implementation-ready creative, motion, asset, accessibility, and engineering plan
**Primary source:** `car_portfolio_ultimate_production_brief.md`
**Factual content source:** `lib/content.ts`
**Asset-rights source:** `ASSET_LICENSES.md`

## Production mandate

This is a complete redesign of the cinematic homepage. The former stadium, music-world, room, and explorable-environment direction does not carry into the new homepage. The new experience is a single automotive film in which the vehicle is the subject, transition device, and visual interface.

The implementation must not begin as a generic portfolio shell. Production starts with the Senna vertical slice defined in section 10 and may expand only after that slice passes its visual, motion, factual, accessibility, licensing, and performance gates.

The following rules apply throughout:

- The car remains the dominant visual element; backgrounds stay quiet and subordinate.
- Supplied media under `Images/` is creative reference material only. It must never be imported, copied, optimized, or published as final website media.
- The existing files under `public/vehicles/` are project-generated, original temporary production plates. They are useful for composition and engineering, but they are not approved final vehicle media.
- Upscaling a reference image or a temporary plate does not make it accurate, licensed, or production-ready.
- All public facts come from `lib/content.ts`. Motion concepts may frame those facts but must not embellish them.
- Text is clean DOM content with scroll-led choreography. There are no distorted text hovers, animated font-width tricks, letter scrambles, gradient type, or generic startup slogans.
- Scroll motion must reverse predictably and remain visually stable at every paused frame.

## Source-of-truth hierarchy

When sources conflict, use this order:

1. `lib/content.ts` for names, dates, roles, metrics, project status, disclaimers, links, and archive status.
2. `ASSET_LICENSES.md` for whether an asset can appear in a public build.
3. This plan and the production brief for creative and technical direction.
4. `Images/` and the three supplied sample videos for framing and pacing reference only.

Do not infer facts from filenames, imagery, vehicle brands, project metaphors, or former website copy.

---

## 1. Final sitemap and narrative sequence

### Route structure

| Route | Production purpose |
| --- | --- |
| `/` | One continuous automotive overview: identity, experience, projects, about, creative work, and contact |
| `/experience` | Accessible professional timeline with the complete factual experience records |
| `/projects` | Semantic project index |
| `/projects/[slug]` | Evidence-led case study using the existing factual project fields |
| `/about` | Education, location, interests, and values |
| `/archive` | VFX and photography structure; all current entries remain explicitly marked `Placeholder` |
| `/resume` | Accessible résumé route |
| `/contact` | Email, GitHub, résumé, and location |

Homepage navigation is a small fixed chapter index with deep links to `#experience`, `#projects`, `#about`, `#creative`, and `#contact`. It must remain keyboard accessible and must not become a large navbar.

### Narrative sequence

1. **Opening / Identity** — near-black automotive abstraction pulls backward to reveal Aayu's identity.
2. **Experience / McLaren Senna** — precision and professional execution emerge through macro details, a full-car settle, and a reversible door opening.
3. **Projects / Formula-style engineering** — the Senna wheel becomes an F1-style tyre; projects are revealed through steering, telemetry, suspension, cockpit, and system details.
4. **About / Skyline R34** — the F1 rear light becomes the Skyline's circular taillight; a registered hood X-ray reveals the personal and engineering interests beneath the surface.
5. **Creative / Lens** — the taillight becomes a camera aperture that introduces honest VFX and photography placeholders plus writing/editorial entry points.
6. **Contact / End frame** — the aperture closes and the visual recedes into black, leaving only direct contact actions.

### Factual copy contract

The cinematic homepage may shorten records but may not change their meaning.

#### Identity

- Name: **Aayu Pratap Singh**
- Location: **Waterloo, Ontario**
- Role: **Engineer & Founder**
- Positioning: Computer Science student at the University of Waterloo working across full-stack products, machine learning, infrastructure, simulation, and creative technology.
- Public contact: `aayupsuw@gmail.com`
- GitHub: `https://github.com/aayups31`

Do not add age, graduation date, phone number, LinkedIn URL, availability status, awards, clients, or slogans unless they are added to the factual content source.

#### Experience

The homepage may show company, role, period, and one concise evidence line:

- **UniMarket — Founder & Sole Engineer — Jun 2026 to Present — In progress.** It is independently built and restricted to users authenticated through an `@uwaterloo.ca` email. Do not imply University endorsement.
- **WAT.AI — SportsNext — Machine Learning Engineer — Jun 2026 to Present — In progress.** Describe Mamba, the Dreamer-style recurrent state-space model, PyTorch pipelines, and next-action research only at the level in `lib/content.ts`; keep unpublished and team-confidential details private.
- **ATS Corporation — Network Technician Co-op — Sep 2025 to Apr 2026.** Approved evidence includes 30+ private project networks, up to 3x wireless improvement, a refresh across 3 racks and 18 switches, and 150+ incidents with a reported 97% permanent closure rate.

#### Projects

Use the current titles, periods, statuses, descriptions, evidence, stacks, and caveats:

1. F1 Strategy Engine — active telemetry and simulation work; never invent prediction accuracy or completed results.
2. UniMarket — active full-stack product with security and ownership designed into the data layer; the approved external link is `https://www.myunimarket.com`.
3. SportsNext World Model — active WAT.AI team research; unpublished results and confidential detail remain withheld.
4. AI Personal Finance Manager — educational prototype using synthetic or user-controlled data; not financial advice and no investment-performance claim.
5. Emotion-Powered Music Mixer — completed prototype; no identifiable face data may be included, and any demonstration needs consent and privacy controls.

#### About and creative work

The four existing values may be edited for length but not converted into invented claims: own the path, make complexity legible, design for real conditions, and keep curiosity in the loop. Confirmed interests include football, Formula 1, film, photography, VFX, and the music of Linkin Park, Hans Zimmer, and Michael Jackson.

Current archive records are four placeholders: Projection study, Breakdown study, Architecture study, and Motion study. They must remain labelled as placeholders until Aayu supplies real work, role, date, credits, process, and permission.

---

## 2. Scroll storyboard and pinned durations

### Runtime model

Use one persistent fixed `100svh` visual stage and semantic document-flow scene tracks. Do not create nested sticky sections or six unrelated pinning systems. Each chapter owns a local GSAP timeline driven by measured scroll progress. The total desktop scrub distance is approximately `3200vh`.

Lenis runs with `autoRaf: false` from the GSAP ticker. ScrollTrigger consumes that single scroll source. Do not add a second numeric scrub delay on top of Lenis smoothing. Do not update React state per animation frame.

| Global progress | Chapter | Effective travel | Local shot timeline |
| --- | --- | ---: | --- |
| 0–10% | Opening | 320vh | 0–12% near-black body reflection; 12–45% controlled dolly backward; 45–75% name and positioning lock into place; 75–100% carbon/body surface resolves into the Senna |
| 10–35% | Senna experience | 800vh | 0–8% body line; 8–20% front aero/light; 20–32% wheel and brake; 32–42% exhaust; 42–58% full-car pullback; 58–76% reversible doors; 76–92% experience facts; 92–100% wheel fills the viewport |
| 35–60% | Formula projects | 800vh | 0–12% tyre match cut; 12–25% F1 Strategy Engine; 25–38% UniMarket; 38–51% SportsNext World Model; 51–64% AI Personal Finance Manager; 64–76% Emotion-Powered Music Mixer; 76–89% full-car project index; 89–100% rear-light transition |
| 60–80% | Skyline about | 640vh | 0–14% circular light resolves; 14–28% headlight and body detail; 28–48% full-car settle; 48–76% registered hood X-ray; 76–90% factual identity fragments; 90–100% taillight becomes a lens aperture |
| 80–92.5% | Creative | 400vh | 0–18% aperture transition; 18–65% VFX/photography media stage; 65–84% editorial/writing index; 84–100% iris close |
| 92.5–100% | Contact | 240vh | 0–45% image recedes to black; 45–80% email, GitHub, and résumé actions; 80–100% end hold |

These distances are tuning baselines, not permission to make scrolling slow. User testing may shorten a chapter, but its relative shot order and transition overlap must remain intact.

### Scroll-led typography system

Text choreography follows camera choreography rather than running as an independent effect layer:

- During the first 15–20% of a text beat, a line enters through an overflow mask while tracking settles by a small amount.
- During the middle 60–70%, type is motionless and readable.
- During the final 15–20%, the vehicle or mechanical object occludes the line as it exits.
- Copy stays hidden during the fastest camera moves and enters only after camera deceleration.
- Major headings may track with the camera briefly, then lock to the grid.
- Metadata arrives as short measurement rules or instrument ticks, not opacity-only card fades.
- Hover never distorts, scales, stretches, scrambles, or changes the font. Text links may receive a restrained underline or color-state change.
- Do not animate a variable font's width axis during interaction.

Typography must remain semantic DOM content above or below an `aria-hidden` visual stage. Decorative masks may animate duplicate visual fragments only when the readable source remains available to assistive technology.

---

## 3. Transition map

| Transition | Shared form | Forward motion | Reverse requirement |
| --- | --- | --- | --- |
| Opening → Senna | Carbon weave and body reflection | Abstract reflection resolves continuously into accurate Senna bodywork | Returns to the same macro crop without a dissolve or state jump |
| Senna → Formula | Wheel and tyre | Senna wheel fills frame; isolated geometry and lighting resolve into a formula tyre | Formula tyre resolves back to the original Senna wheel at the same rotation angle |
| Formula → Skyline | Rear rain light | A single red light expands into a circular graphic and resolves as Skyline taillights | Taillight contracts into the same formula rear-light point |
| Skyline → Creative | Circular taillight | Internal rings become a lens/aperture; creative media is revealed inside it | Aperture closes back into the registered taillight |
| Creative → Contact | Lens iris | Iris closes with a short black-frame punctuation before the contact end frame | Contact recedes and the aperture reopens without flashing an unloaded frame |

Each transition occupies approximately the outgoing chapter's last 8–12% and the incoming chapter's first 8–12% through a shared transition layer. There must be one reversible timeline, not separate down-scroll and up-scroll event animations.

---

## 4. Asset generation and acquisition list

### Current project-generated plates

The following 1672 × 941 PNGs are **original temporary production plates generated for this project**:

- Senna: `senna-body-macro-v1.png`, `senna-wheel-macro-v1.png`, `senna-exhaust-macro-v1.png`, `senna-hero-closed-v1.png`, `senna-hero-open-v1.png`
- Formula: `f1-cockpit-v1.png`, `f1-hero-v1.png`
- Skyline: `skyline-hero-closed-v1.png`, `skyline-hero-xray-v1.png`

They may be used for private layout, timeline, responsive-crop, and performance development. They remain temporary because final approval still requires vehicle-accuracy comparison, provenance documentation, trademark review, high-resolution master generation, and paused-frame QA. WebP files created by `scripts/prepare-vehicle-assets.mjs` inherit the same temporary status.

### Supplied reference pack

Everything under `Images/`, including its short MP4 studies, remains outside the production asset pipeline. It may inform macro framing, shot rhythm, camera direction, and lighting notes only. No watermark-removal workflow is permitted. No generated replacement may intentionally reproduce a reference composition one-to-one.

### Final acquisition requirements

#### Senna

- Legally usable, mechanically accurate high-resolution model or owned/licensed render source.
- Separately rigged doors with correct pivots, wheels, brakes, glass, body, and shadow geometry.
- Five approved desktop compositions and separate portrait/mobile compositions.
- Body, glass, door, wheel, shadow, reflection, depth, and normal passes.
- Optimized high/medium LOD GLBs and a pre-rendered door fallback.

#### Formula-style car

- One coherent era and aero language; use a generic/unbranded livery unless real marks are specifically cleared.
- Isolated tyre, steering wheel, cockpit, suspension, and rear-light assets.
- Original component plates, full-car plates, depth maps, masks, and a frontal movement sequence.

#### Skyline R34

- Accurate closed-hood hero plate.
- Perfectly registered RB26 engine-underlay plate.
- Hood, engine, body, light, reflection, depth, and residual-scan masks.
- Separate mobile composition that preserves hood/engine registration.

#### Creative and shared assets

- Real VFX and photography media with title, role, date, process, credit, and permission metadata.
- Original or licensed mechanical sound effects.
- Licensed production typeface files or an approved open-source fallback.
- Responsive posters and video encodes for every motion asset.

### Licensing gate

Before an asset can move from temporary to production, `ASSET_LICENSES.md` must record creator/source, license or written permission, web/commercial scope, credit requirement, trademark/likeness considerations, and approval status. “Owner supplied,” “AI generated,” and “found online” are not sufficient production licenses.

---

## 5. Image-enhancement pipeline

1. Ingest masters into an immutable non-public source directory with provenance and rights metadata.
2. Reject files with visible watermarks, signatures, social handles, unclear permission, or generator marks.
3. Use supplied references only to create art-direction boards.
4. Source, photograph, render, or generate an original high-accuracy replacement.
5. Work from a 16-bit lossless master at 3200–4096 px for desktop heroes.
6. Apply conservative denoise, restoration, and upscale. Do not allow enhancement to redraw headlights, wheels, seams, badges, exhausts, aero, cockpit controls, or engine hardware.
7. Compare every output with verified vehicle references and reject mechanically inconsistent frames.
8. Generate hand-checked subject, component, glass, reflection, contact-shadow, depth, and normal passes.
9. Composite restrained light, reflection, heat, and atmospheric layers in a color-managed master.
10. Author desktop and mobile crops separately; never rely on automatic center cropping for hero vehicles.
11. Export responsive AVIF/WebP imagery, KTX2 textures, and compatible H.264/WebM fallback motion. Strip private EXIF and source metadata from public derivatives.
12. Review every final frame at 100% and 200% for warped wheels, incorrect hinges, engine misregistration, panel artifacts, sharpening halos, banding, and compression.

The existing preparation script can produce delivery-sized derivatives and a manifest. It is not an AI restoration or accuracy-validation system, and a 3840 px derivative of a 1672 px plate is still derived from a temporary plate.

---

## 6. 2.5D versus real-3D decisions

| Shot | Primary technique | Reason and fallback |
| --- | --- | --- |
| Opening macro/reflection | Layered 2.5D render | Small, controlled camera travel; depth and reflection passes provide dimensionality |
| Senna body/aero macro | 2.5D plus restrained reflection shader | Silhouette does not change enough to justify live geometry |
| Senna wheel and Formula match cut | Isolated real 3D | Rotation and silhouette continuity must remain physically convincing |
| Senna exhaust | 2.5D plus heat-distortion shader | Stable detail plate is cheaper and more accurate than a full live car |
| Full Senna reveal | Blender-authored render with limited 2.5D depth | No arbitrary browser orbit; use an approved, repeatable camera path |
| Senna doors | Real 3D hinge rig on high tier | Medium/mobile use a pre-rendered scrub sequence from the same rig; never fake doors with flat rectangles |
| Experience facts | Semantic DOM with vehicle occlusion masks | Keeps copy crisp, selectable, indexable, and accessible |
| Formula tyre | Isolated real 3D | Supports spin interaction and the Senna match cut |
| Formula steering/suspension | Isolated 3D on high tier | Medium uses pre-rendered component turns |
| Formula cockpit/side/rear | 2.5D original plates | Controlled camera pushes do not need a complete live vehicle |
| Formula frontal speed shot | Pre-rendered 3D sequence | Consistent motion blur and frame pacing |
| Skyline lights/full car | 2.5D original plates | Stable iconic framing and lower runtime cost |
| Skyline hood X-ray | Registered 2.5D WebGL composition | Cursor/touch reveals the engine under the existing hood; a complete 3D car is unnecessary |
| Creative aperture | Small real-time geometry or shader | Simple geometry materially improves the lens transition |
| Creative media/contact | DOM and WebGL texture masks | No 3D environment is required |

Real 3D is reserved for changing silhouettes, hinges, and rotational match cuts. A shot does not become more premium merely because it uses Three.js.

---

## 7. Audio interaction plan

- Audio is off by default and begins only after an explicit user action.
- Use one Web Audio graph with master, ambience, vehicle, and interface buses.
- Senna cues: restrained latch, hinge movement, wheel/brake click, and low mechanical ambience.
- Formula cues: steering-switch ticks, a short tyre spin, and ignition/rev only on deliberate press or hold.
- Skyline cues: diagnostic scan, hood/latch detail, and an original or licensed RB26-style cue.
- Creative cue: subtle projector/aperture mechanics.
- Contact: controlled fade to silence.

Continuous ambience may morph with scroll. Discrete sounds fire only when progress crosses a physical event, with direction awareness, hysteresis, and cooldown so slow reverse scrolling does not chatter. Sound must synchronize with the visible contact point and may never be the only feedback.

All recordings require provenance and permission. Do not bundle copyrighted music, pit radio, broadcast audio, artist recordings, or unlicensed engine samples. Target approximately -16 LUFS for isolated cues, quieter ambience, and peaks below -1 dBTP.

---

## 8. Performance budget and stability gate

| Area | Desktop high-tier budget | Medium/mobile budget |
| --- | ---: | ---: |
| Frame time | p95 under 16.7 ms | stable p95 under 33 ms |
| Initial JavaScript | at most 220 KB gzip; 3D code split separately | same semantic shell; no eager 3D bundle |
| Critical fonts | at most 90 KB | at most 70 KB |
| Opening + first Senna poster | at most 2.5 MB | at most 1.2 MB |
| Prefetched next chapter | at most 6 MB | at most 2.5 MB |
| Total on-demand cinematic media | at most 35 MB | at most 12 MB |
| Simultaneous 4K textures | at most 2 | use 2K/1K sources |
| GPU memory | under 180 MB | under 96 MB; under 64 MB low tier |
| Visible geometry | at most 450k triangles / 80 draw calls | at most 150k triangles / 40 draw calls |
| Device pixel ratio | cap at 1.5 | cap at 1.25 tablet and 1.0 mobile |

Experience targets are LCP at or below 2.5 seconds, CLS at or below 0.02, INP below 200 ms, and no interaction-time main-thread task over 50 ms.

Engineering requirements:

- One GSAP/Lenis animation clock; no competing requestAnimationFrame loops.
- Transform, mask, and shader-uniform animation only; do not animate layout dimensions or offsets continuously.
- Reserve every media dimension before decode and do not reveal an undecoded frame.
- Mount only the active chapter and its immediate neighbor where practical.
- Pause rendering when the tab is hidden and dispose media/geometry after it is safely behind the visitor.
- Sample runtime frame rate and reduce DPR, shader detail, depth layers, or live 3D after sustained sub-45 FPS performance.
- Test slow trackpad, fast trackpad, wheel, reverse scroll, resize, zoom, orientation change, tab restore, Chrome, and Safari.

No chapter is visually approved if it looks premium in a still screenshot but stutters while scrolling.

---

## 9. Responsive, reduced-motion, and accessibility fallback plan

### Capability tiers

- **Desktop, 1024 px and above:** full timeline, isolated live 3D, richer depth and shaders; approximately `3200vh` total travel.
- **Tablet, 768–1023 px:** reduced layer count, pre-rendered component turns, lower DPR; approximately `2200vh`.
- **Mobile, below 768 px:** dedicated portrait compositions, `100svh`, short stable scene tracks, pre-rendered door sequence, and approximately `1500–1700vh` total travel.
- **Save-Data or low tier:** 1080p stills, no sound prefetch, simplified masks, no live 3D.
- **No WebGL:** responsive pictures and pre-rendered clips following the same narrative.
- **Reduced motion:** authored static hero frames and short masked cuts; no long camera scrub, parallax, wheel spin, cursor trail, or empty disabled stage.

Desktop hover interactions require equivalent input paths:

- Skyline X-ray: pointer on desktop, tap-and-drag on touch, and focusable keyboard toggle.
- Wheel spin: pointer/press on desktop and a focusable tap/Enter control on touch/keyboard.
- Audio: visible toggle with programmatic state and no autoplay.

Accessibility gates:

- Semantic reading order matches the narrative independently of the visual layer.
- Canvas, shader layers, and decorative duplicate media are `aria-hidden`.
- All factual text remains selectable DOM content.
- A skip link, visible focus states, focus-contained navigation menu, Escape behavior, and anchor focus restoration work.
- Normal text reaches 4.5:1 contrast and large text reaches 3:1 against every animated frame.
- No scroll trap, forced horizontal scroll, keyboard-only dead end, or content available only through sound or pointer movement.
- Motion preference persists locally while continuing to respect the operating-system setting.
- Missing media or failed WebGL initialization must reveal the semantic portfolio immediately.

---

## 10. Senna vertical-slice implementation plan

The Senna slice includes the incoming carbon transition, experience sequence, door interaction, scroll typography, audio hooks, and outgoing wheel transition. It is not only a static hero prototype.

### Phase A — content and asset gate

1. Freeze the three factual experience records and choose the single evidence line shown for each.
2. Select and document the final typography license; until then, current fonts are development-only. Keep any variable-width axis fixed.
3. Acquire a legally usable, accurate Senna source with separate door geometry.
4. Verify headlights, front aero, wheel/brake proportions, exhaust placement, silhouette, door shape, pivots, and open angles.
5. Update the asset ledger before the source enters production.

### Phase B — offline shot production

1. Rig both doors around physically plausible pivots in Blender.
2. Author one continuous camera path covering macro body, front aero, wheel, exhaust, full-car settle, doors, experience hold, and outgoing wheel.
3. Render review stills at every timeline checkpoint before browser integration.
4. Produce high/medium LOD geometry, KTX2 textures, masks, depth/normal/reflection passes, and a pre-rendered fallback from the same approved scene.
5. Create separately composed desktop and mobile outputs.

### Phase C — runtime foundation

1. Create one fixed visual stage with semantic scene tracks beneath it.
2. Integrate Lenis with the GSAP ticker and ScrollTrigger refresh lifecycle.
3. Build a deterministic quality selector from WebGL capability, memory, core count, viewport, Save-Data, reduced motion, and observed frame rate.
4. Add an asset manifest and decode-before-reveal loader.
5. Keep animation values outside React render state.

### Phase D — local Senna timeline

Use the `800vh` local timeline exactly as a first calibration target:

- 0–8% body line
- 8–20% front aero/light
- 20–32% wheel/brake
- 32–42% exhaust
- 42–58% full-car pullback and settle
- 58–76% reversible door opening
- 76–92% experience facts in the open-door negative space
- 92–100% wheel fill and Formula transition handoff

Door state must be derived from scroll progress, not triggered as a one-time animation. Reverse scroll must close the doors along the identical path.

### Phase E — typography and interaction

1. Enter the section label only after the first camera settle.
2. Reveal each experience item through a vehicle/body mask, hold it completely still, then clear it before the next camera move.
3. Keep company, role, period, status, and evidence factual and readable.
4. Use no text hover animation. Links receive only restrained underline/color feedback.
5. Add optional wheel and door sounds only after user opt-in.

### Phase F — fallbacks and QA

1. Implement medium/mobile pre-rendered door motion, no-WebGL posters, and a reduced-motion cut version.
2. Test slow and fast trackpad, wheel, reverse, resize during the pin, orientation, browser zoom, tab switching, Chrome, and Safari.
3. Capture visual-regression frames at local progress `0`, `.08`, `.20`, `.32`, `.42`, `.58`, `.67`, `.76`, `.84`, `.92`, and `1`.
4. Audit console errors, failed requests, decode flashes, layout shift, focus behavior, contrast, sound state, and memory disposal.

### Exit criteria

Do not begin full Formula and Skyline production until all of the following are true:

- The Senna source has documented rights and passes mechanical-accuracy review.
- Doors open and close smoothly and plausibly in both directions.
- Every paused frame remains sharp, stable, and compositionally intentional at desktop and mobile sizes.
- Text is clean, premium, readable, synchronized with the image, and free of hover distortion.
- The high tier sustains the 60 FPS target on the agreed test device; lower tiers degrade gracefully without jitter.
- Reduced-motion, touch, keyboard, no-WebGL, missing-media, and audio-off paths remain complete.
- No sample from `Images/` or provisional legacy media appears in the public cinematic route.

---

## Production risks and decisions still requiring approval

- A final accurate, legally usable Senna model with separable doors is the primary asset dependency.
- Current generated plates are composition prototypes, not substitutes for accuracy or licensing review.
- Real Formula team branding, liveries, and broadcast material require explicit clearance; an original unbranded formula-car treatment is the safe default.
- The final premium typeface requires a valid web license. Current repository fonts may remain fallbacks but must not be animated through their width axis.
- Real VFX and photography media has not yet replaced the honest placeholders.
- The 4K visual target and 60 FPS target are co-equal; capability tiers and pre-rendered fallbacks are mandatory, not optional polish.

This plan is approved for implementation only in the sequence above: asset and factual gates first, Senna vertical slice second, performance and accessibility acceptance third, then the remaining automotive chapters.
