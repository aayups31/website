# Asset license ledger

The motion system, typography treatments, SVG placeholders, and generated effect studies are original to this repository. Owner-supplied reference images remain outside the production pipeline; their original sources and public-web permissions have not been documented, so they are approved for private reference use only.

| Asset | Source | License / permission | Status |
| --- | --- | --- | --- |
| Cinematic motion system and CSS treatments | Original code in this repository | Project-owned | Approved |
| Archive placeholder SVGs | Original vectors in this repository | Project-owned | Approved |
| Newsreader Variable | Fontsource package | SIL Open Font License 1.1 | Approved |
| Helvetica Neue / Helvetica / Arial stack | Visitor system fonts; no webfont file shipped | Platform font licenses | Approved |
| `public/vehicles/{senna,f1,skyline}/*-v1.png` | Original AI-generated temporary vehicle plates produced for this project from owner-supplied composition references | Project prototype use; generated imagery still requires final model-accuracy and trademark review | Temporary production plate |
| `public/vehicles/senna/door-open-v2/*.png` | Original AI-generated registered door-motion studies produced for this project | Project prototype use; registration and McLaren Senna geometry require final frame-by-frame review | Temporary sequence plate |
| `public/vehicles/optimized/senna/door-motion-flow-v1/**` | Deterministic optical-flow in-betweens derived from the registered temporary door-motion plates; method and source hashes are recorded in `manifest.json` | Project prototype use; interpolation smooths timing but does not certify the underlying vehicle geometry | Temporary sequence derivative |
| `public/vehicles/senna/video-derived/**` | Deterministic frames extracted from the owner-supplied `Images/Mclaren/Now_do_the_same_for_these_samp.mp4`; exact source hash and frame window are recorded in `provenance.json` | Owner-directed prototype use only; upstream public-use rights are undocumented, and the visible generation mark plus vehicle branding are intentionally retained | Prototype only — clearance required before public deployment |
| `public/vehicles/f1/ferrari/*.png` | Original AI-generated Ferrari-inspired visual-development plates produced for this project | Private prototype use only; Ferrari vehicle likeness, trade dress, technical accuracy, and any implied affiliation require clearance and review before public release | Temporary production plate |
| `public/vehicles/skyline/v2/*.png` | Original AI-generated Skyline R34-inspired visual-development plates produced for this project | Private prototype use only; Nissan/Skyline vehicle likeness and mechanical accuracy require clearance and review before public release | Temporary production plate |
| `public/vehicles/effects/skyline-engine-{ink-mask,depth}-v1.png` | Original AI-generated transition mask and approximate depth study derived from the project-bound Skyline engine plate | Project prototype use; depth is an artistic approximation and is not geometrically certified | Temporary effect asset |
| `public/vehicles/optimized/**` | Deterministic WebP derivatives of the original temporary plates | Same status as source plate | Temporary production plate |
| `.reference-archive/legacy-public-media/*` (19 images) | Supplied by site owner; removed from `public/` in the automotive redesign | Original source / license not documented; includes visible marks, brands, and artist likenesses | Local reference only — ignored by Git and excluded from deployment |

The site does not claim that these supplied studies are Aayu's photography or VFX work, and it does not imply affiliation with the depicted clubs, teams, brands, or artists. Replace or clear every provisional asset before a public production launch; record final creator credits, license terms, and usage scope here.

The owner-supplied `Images/` directory is excluded from Git. Except for the explicitly requested, provenance-tracked Senna video derivative above, its low-resolution stills and watermarked motion samples remain composition references only and must never be served by the website. The original temporary vehicle plates above contain no copied watermark or sponsor livery and are deliberately presented as visual-development assets—not as licensed manufacturer renders or mechanically certified models.
