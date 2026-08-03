export type ExperienceItem = {
  id: string;
  organisation: string;
  role: string;
  period: string;
  status?: "In progress";
  discipline: string;
  summary: string;
  evidence: string[];
  stack: string[];
  href?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  lead: string;
  period: string;
  status?: "In progress" | "Completed";
  category: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  evidence: string[];
  stack: string[];
  note?: string;
  externalUrl?: string;
};

export type ArchiveItem = {
  id: string;
  category: "VFX" | "Photography";
  title: string;
  status: "Placeholder";
  aspect: "landscape" | "portrait" | "cinema";
  source: string;
  alt: string;
};

export const siteConfig = {
  name: "Aayu Pratap Singh",
  shortName: "Aayu",
  location: "Waterloo, Ontario",
  email: "aayupsuw@gmail.com",
  github: "https://github.com/aayups31",
  title: "Engineer & Founder",
  description:
    "Computer Science student at the University of Waterloo building full-stack products, machine-learning systems, infrastructure, and simulation tools.",
};

export const experience: ExperienceItem[] = [
  {
    id: "unimarket",
    organisation: "UniMarket",
    role: "Founder & Sole Engineer",
    period: "Jun 2026 — Present",
    status: "In progress",
    discipline: "Product ownership",
    summary:
      "An independently built marketplace restricted to users authenticated through an @uwaterloo.ca email address.",
    evidence: [
      "Designed email OTP, row-level access controls, protected routes, private storage, and owner-scoped data access.",
      "Built listings, drafts, multi-image uploads, search, messaging, moderation, and responsive interfaces.",
      "Owned the product path from database policy to the interface a student touches.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Vercel"],
    href: "/projects/unimarket",
  },
  {
    id: "sportsnext",
    organisation: "WAT.AI — SportsNext",
    role: "Machine Learning Engineer",
    period: "Jun 2026 — Present",
    status: "In progress",
    discipline: "Learning match dynamics",
    summary:
      "Working with the SportsNext team on a soccer world model that learns latent match dynamics and predicts what happens next.",
    evidence: [
      "Developing Mamba-based sequence modelling and a Dreamer-style recurrent state-space model.",
      "Building PyTorch pipelines across player tracking, ball state, contextual, and event data.",
      "Exploring next-action prediction while keeping team and unpublished research boundaries explicit.",
    ],
    stack: ["Python", "PyTorch", "Mamba", "RSSM", "Data pipelines"],
    href: "/projects/sportsnext-world-model",
  },
  {
    id: "ats",
    organisation: "ATS Corporation",
    role: "Network Technician Co-op",
    period: "Sep 2025 — Apr 2026",
    discipline: "Reliable infrastructure",
    summary:
      "Designed, deployed, documented, and supported network infrastructure across more than ten sites.",
    evidence: [
      "Designed and deployed 30+ private project networks for enterprise automation systems.",
      "Improved wireless performance by up to 3× and completed a refresh spanning 3 racks and 18 switches.",
      "Resolved 150+ incidents with a reported 97% permanent closure rate.",
    ],
    stack: ["Cisco", "VLANs", "ACLs", "Wireless", "Infrastructure"],
    href: "/experience#ats",
  },
];

export const projects: Project[] = [
  {
    slug: "f1-strategy-engine",
    index: "01",
    title: "F1 Strategy Engine",
    lead: "Race strategy, tested in simulation.",
    period: "May 2026 — Present",
    status: "In progress",
    category: "Telemetry · Simulation",
    summary:
      "A telemetry-driven strategy platform for studying tyre degradation, lap time, compound choice, pit timing, fuel, weather, and full-race tradeoffs.",
    problem:
      "A race result emerges from interacting systems rather than a single fast lap. Strategy needs a way to compare decisions across changing track, tyre, weather, and fuel conditions.",
    approach:
      "Build historical and telemetry ingestion first, model individual performance factors, then evaluate them together inside repeatable race-state simulations.",
    outcome:
      "The work is currently an active engineering project. The portfolio presents its architecture and decision model without inventing race-prediction accuracy or completed results.",
    evidence: [
      "Historical season and telemetry ingestion",
      "Tyre-degradation and lap-time simulation",
      "Compound, pit-window, fuel, and weather scenarios",
      "Probabilistic performance and race-state evaluation",
    ],
    stack: ["Python", "Telemetry systems", "Simulation", "Data pipelines"],
  },
  {
    slug: "unimarket",
    index: "02",
    title: "UniMarket",
    lead: "A marketplace with access control at its core.",
    period: "Jun 2026 — Present",
    status: "In progress",
    category: "Product · Full stack",
    summary:
      "An independently built marketplace for users authenticated through a University of Waterloo email address.",
    problem:
      "A campus marketplace needs more than listings. It needs clear ownership, private communication, trustworthy access boundaries, resilient media handling, and a credible moderation path.",
    approach:
      "Design security and ownership into the data layer, then build each marketplace flow against the same policy model instead of treating protection as a final pass.",
    outcome:
      "A working product system covering authentication, listing lifecycle, discovery, private messaging, moderation, media, and responsive interaction.",
    evidence: [
      "Email OTP and PostgreSQL row-level security",
      "Protected APIs, private object storage, and owner-scoped access",
      "Draft persistence, search, messaging, moderation, and uploads",
      "Responsive desktop and mobile interfaces",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Vercel"],
    externalUrl: "https://www.myunimarket.com",
  },
  {
    slug: "sportsnext-world-model",
    index: "03",
    title: "SportsNext World Model",
    lead: "Predicting the next move from the state of the match.",
    period: "Jun 2026 — Present",
    status: "In progress",
    category: "Machine learning · Team research",
    summary:
      "A WAT.AI team project exploring latent representations of soccer match dynamics and next-action prediction.",
    problem:
      "A football match is a partially observed, multi-agent system. Useful representations must connect tracking, ball state, context, and events across time.",
    approach:
      "Combine Mamba-based sequence modelling with a Dreamer-style recurrent state-space model, supported by PyTorch data pipelines for heterogeneous match data.",
    outcome:
      "Research is ongoing. This overview describes Aayu's current engineering direction while withholding unpublished results and team-confidential detail.",
    evidence: [
      "Mamba-based sequence modelling",
      "Dreamer-style recurrent state-space model",
      "Tracking, ball-state, contextual, and event data",
      "PyTorch next-action prediction pipelines",
    ],
    stack: ["Python", "PyTorch", "Mamba", "RSSM", "Sequence modelling"],
    note: "Team work through WAT.AI SportsNext; results and diagrams remain intentionally high-level.",
  },
  {
    slug: "ai-finance-manager",
    index: "04",
    title: "AI Personal Finance Manager",
    lead: "A financial history you can question.",
    period: "Apr 2026 — Present",
    status: "In progress",
    category: "RAG · Data product",
    summary:
      "An educational financial-management prototype that turns transaction history into categorized analytics, longer-term patterns, and natural-language exploration.",
    problem:
      "Transaction lists show what happened but rarely make patterns, context, or changing habits easy to investigate.",
    approach:
      "Combine a structured categorization and analytics pipeline with RAG-based querying, then present the output through focused visual explanations.",
    outcome:
      "The prototype is in development and uses synthetic or user-controlled data. It is not financial advice and does not claim investment performance.",
    evidence: [
      "Transaction categorization and expenditure analytics",
      "RAG-based context-aware querying",
      "Interactive dashboards and trend exploration",
      "Budgeting and recommendation-system experiments",
    ],
    stack: ["Python", "RAG", "AI agents", "Data visualization"],
    note: "Educational prototype only. Any demonstrations must use synthetic data.",
  },
  {
    slug: "emotion-music-mixer",
    index: "05",
    title: "Emotion-Powered Music Mixer",
    lead: "Playback shaped by expression and movement.",
    period: "Dec 2024 — Jun 2025",
    status: "Completed",
    category: "Creative technology · Real time",
    summary:
      "A real-time music system that adapts playback and transitions using facial emotion, lip movement, and body-motion signals.",
    problem:
      "Responsive media needs to interpret noisy signals quickly enough that its reaction still feels connected to the person in front of it.",
    approach:
      "Fuse multiple visual signals, tune them for low-light and multi-face conditions, then map the result to tempo, melody, key, and playback decisions.",
    outcome:
      "A completed prototype for responsive playback and mashup generation, with privacy and consent treated as requirements for any future public demonstration.",
    evidence: [
      "Facial emotion, lip movement, and body-motion analysis",
      "Tempo, melody, and key-based mashup generation",
      "Low-light optimization and multi-face tracking",
      "Responsive real-time playback",
    ],
    stack: ["Python", "Flask", "Spotify API", "Librosa", "MediaPipe", "DeepFace"],
    note: "No identifiable face data is included in this portfolio.",
  },
];

export const archiveItems: ArchiveItem[] = [
  {
    id: "vfx-volume",
    category: "VFX",
    title: "Projection study",
    status: "Placeholder",
    aspect: "cinema",
    source: "/placeholders/vfx-volume.svg",
    alt: "Abstract monochrome projection study placeholder for future VFX work.",
  },
  {
    id: "vfx-breakdown",
    category: "VFX",
    title: "Breakdown study",
    status: "Placeholder",
    aspect: "landscape",
    source: "/placeholders/vfx-breakdown.svg",
    alt: "Abstract split-frame placeholder for a future VFX before-and-after breakdown.",
  },
  {
    id: "photo-architecture",
    category: "Photography",
    title: "Architecture study",
    status: "Placeholder",
    aspect: "portrait",
    source: "/placeholders/photo-architecture.svg",
    alt: "High-contrast architectural photography placeholder.",
  },
  {
    id: "photo-motion",
    category: "Photography",
    title: "Motion study",
    status: "Placeholder",
    aspect: "landscape",
    source: "/placeholders/photo-motion.svg",
    alt: "Abstract motion photography placeholder with a moving light trace.",
  },
];

export const values = [
  {
    index: "01",
    title: "Own the path",
    copy: "From authentication to interface, model pipeline to output, I want to understand how the whole experience holds together.",
  },
  {
    index: "02",
    title: "Make complexity legible",
    copy: "Documentation, interfaces, and visual hierarchy are part of the engineering—not decoration around it.",
  },
  {
    index: "03",
    title: "Design for real conditions",
    copy: "Low light, changing inputs, and unreliable connections are where a system proves itself.",
  },
  {
    index: "04",
    title: "Keep curiosity in the loop",
    copy: "Football, Formula 1, film, photography, VFX, and the music of Linkin Park, Hans Zimmer, and Michael Jackson reshape how I think about timing, atmosphere, and detail.",
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);
