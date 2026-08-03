import { ExperienceLoader } from "@/components/experience/experience-loader";
import { SiteHeader } from "@/components/site-header";
import { ArrowLink } from "@/components/arrow-link";
import { experience, projects, siteConfig } from "@/lib/content";

const musicInfluences = [
  {
    index: "01",
    artist: "Linkin Park",
    motif: "Pressure / release",
    copy: "Melody, texture, and raw force occupying the same space. A reminder that precision does not have to erase feeling.",
  },
  {
    index: "02",
    artist: "Hans Zimmer",
    motif: "Architecture / scale",
    copy: "Sound built like a world: motifs accumulate, space opens, and a single pulse can carry an entire sequence.",
  },
  {
    index: "03",
    artist: "Michael Jackson",
    motif: "Rhythm / control",
    copy: "Every movement, pause, and silhouette feels intentional. The lesson is not spectacle alone; it is command of timing.",
  },
];

export default function HomePage() {
  const f1Project = projects.find((project) => project.slug === "f1-strategy-engine")!;
  const financeProject = projects.find((project) => project.slug === "ai-finance-manager")!;
  const musicProject = projects.find((project) => project.slug === "emotion-music-mixer")!;

  return (
    <>
      <SiteHeader immersive />
      <ExperienceLoader />
      <main id="main-content" className="cinematic-home">
        <section className="chapter hero-chapter" data-world="prologue" aria-labelledby="hero-title">
          <div className="chapter-frame hero-frame">
            <p className="hero-coordinate">
              {siteConfig.name} · {siteConfig.location}
            </p>
            <h1 id="hero-title">
              <span>The work</span>
              <span className="hero-title__serif">behind the moment.</span>
            </h1>
            <p className="hero-deck">
              Founder and Computer Science student at the University of Waterloo,
              building full-stack products, machine-learning systems, infrastructure,
              and simulations.
            </p>
            <div className="hero-actions">
              <ArrowLink href="#performance">Enter the experience</ArrowLink>
              <ArrowLink href="/projects">View the portfolio</ArrowLink>
            </div>
            <div className="scroll-cue" aria-hidden="true">
              <span>Scroll to enter</span>
              <i />
            </div>
          </div>
        </section>

        <section
          id="performance"
          className="world-chapter world-chapter--football"
          data-world="football"
          aria-labelledby="performance-title"
        >
          <div className="world-intro world-copy world-copy--left">
            <p className="chapter-label"><span>01</span> Performance</p>
            <h2 id="performance-title">
              What happens under the lights is built backstage.
            </h2>
            <p>
              Three kinds of work. One operating principle: understand the system,
              prepare for pressure, and own the result.
            </p>
          </div>

          {experience.map((item, index) => (
            <article
              className={`world-beat world-beat--${index % 2 ? "left" : "right"}`}
              key={item.id}
              id={item.id === "ats" ? "ats" : undefined}
            >
              <div className="world-copy experience-copy">
                <div className="beat-meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{item.discipline}</span>
                  {item.status ? <span>{item.status}</span> : null}
                </div>
                <h3>{item.organisation}</h3>
                <p className="beat-role">{item.role} · {item.period}</p>
                <p className="beat-summary">{item.summary}</p>
                <ul className="evidence-lines">
                  {item.evidence.map((line) => <li key={line}>{line}</li>)}
                </ul>
                {item.href ? <ArrowLink href={item.href}>Read the work</ArrowLink> : null}
              </div>
            </article>
          ))}

          <div className="world-closing world-copy world-copy--right">
            <p className="closing-line">
              Product. Models. Infrastructure. Different arenas, one standard:
              make the system hold.
            </p>
            <ArrowLink href="/experience">View complete experience</ArrowLink>
          </div>
        </section>

        <section
          id="precision"
          className="world-chapter world-chapter--racing"
          data-world="racing"
          aria-labelledby="precision-title"
        >
          <div className="world-intro world-copy world-copy--right">
            <p className="chapter-label"><span>02</span> Precision</p>
            <h2 id="precision-title">Every signal changes the race.</h2>
            <p>Projects about turning complex data into the next decision.</p>
          </div>

          <article className="world-beat world-beat--left">
            <div className="world-copy project-feature">
              <div className="beat-meta">
                <span>Featured system</span>
                <span>{f1Project.period}</span>
                <span>{f1Project.status}</span>
              </div>
              <h3>{f1Project.title}</h3>
              <p className="beat-summary">{f1Project.summary}</p>
              <div className="signal-sequence" aria-label="F1 Strategy Engine capabilities">
                {f1Project.evidence.map((item, index) => (
                  <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>
                ))}
              </div>
              <ArrowLink href={`/projects/${f1Project.slug}`}>Explore the strategy engine</ArrowLink>
            </div>
          </article>

          <article className="world-beat world-beat--right">
            <div className="world-copy paired-projects">
              {[financeProject, musicProject].map((project) => (
                <div className="paired-project" key={project.slug}>
                  <div className="beat-meta">
                    <span>{project.category}</span>
                    <span>{project.period}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <ArrowLink href={`/projects/${project.slug}`}>View project</ArrowLink>
                </div>
              ))}
            </div>
          </article>

          <div className="world-closing world-copy world-copy--left">
            <p className="closing-line">The data matters when it changes the decision.</p>
            <ArrowLink href="/projects">Explore all projects</ArrowLink>
          </div>
        </section>

        <section
          id="music"
          className="world-chapter world-chapter--music"
          data-world="music"
          aria-labelledby="music-title"
        >
          <div className="world-intro world-copy world-copy--left">
            <p className="chapter-label"><span>03</span> Music</p>
            <h2 id="music-title">Three artists. Three kinds of force.</h2>
            <p>
              Linkin Park, Hans Zimmer, and Michael Jackson are the artists I return
              to. Not as decoration—as lessons in tension, scale, rhythm, and release.
            </p>
          </div>

          {musicInfluences.map((influence, index) => (
            <article
              className={`world-beat music-beat world-beat--${index % 2 ? "left" : "right"}`}
              key={influence.artist}
            >
              <div className="world-copy music-artist">
                <div className="music-artist__meta">
                  <span>{influence.index}</span>
                  <span>{influence.motif}</span>
                  <span>Listening influence</span>
                </div>
                <p className="music-artist__number" aria-hidden="true">{influence.index}</p>
                <h3>{influence.artist}</h3>
                <p>{influence.copy}</p>
              </div>
            </article>
          ))}

          <div className="world-closing world-copy world-copy--left">
            <p className="closing-line">
              Build. Release. Rhythm. Atmosphere. The same instincts follow me into
              products, systems, images, and motion.
            </p>
            <ArrowLink href="/about">More about Aayu</ArrowLink>
          </div>
        </section>

        <section
          id="image"
          className="world-chapter world-chapter--archive"
          data-world="archive"
          aria-labelledby="image-title"
        >
          <div className="world-intro world-copy world-copy--right">
            <p className="chapter-label"><span>04</span> Image</p>
            <h2 id="image-title">A different kind of system: the image.</h2>
            <p>
              A cinematic shell for VFX work and photography. These supplied visual
              studies establish the motion language; final credited shots, roles,
              captions, and breakdowns can replace them without redesigning the world.
            </p>
          </div>

          <article className="world-beat world-beat--left archive-beat">
            <div className="world-copy">
              <div className="beat-meta">
                <span>Projection volume</span>
                <span>Media forthcoming</span>
              </div>
              <h3>VFX</h3>
              <p className="beat-summary">
                A projection-led space for finished shots, before-and-after
                breakdowns, and process—presented one sequence at a time.
              </p>
              <p className="placeholder-caption">Motion study · Final credited media pending</p>
            </div>
          </article>

          <article className="world-beat world-beat--right archive-beat">
            <div className="world-copy">
              <div className="beat-meta">
                <span>Contact sequence</span>
                <span>Series forthcoming</span>
              </div>
              <h3>Photography</h3>
              <p className="beat-summary">
                An editorial sequence for photographs, captions, and context—paced
                like a contact sheet rather than a tiled gallery.
              </p>
              <p className="placeholder-caption">Image study · Final photographic series pending</p>
            </div>
          </article>

          <div className="world-closing world-copy world-copy--left">
            <p className="closing-line">
              The archive is intentionally honest: no invented client work, credits,
              or project names.
            </p>
            <ArrowLink href="/archive">Enter the visual archive</ArrowLink>
          </div>
        </section>

        <section
          id="signal"
          className="chapter contact-chapter"
          data-world="contact"
          aria-labelledby="contact-title"
        >
          <div className="chapter-frame contact-frame">
            <p className="chapter-label"><span>05</span> Signal open</p>
            <h2 id="contact-title">Start a conversation.</h2>
            <p>
              For software engineering, machine learning, infrastructure, simulation,
              or creative-technology work, reach me directly.
            </p>
            <div className="contact-actions">
              <ArrowLink href={`mailto:${siteConfig.email}`} external>Email Aayu</ArrowLink>
              <ArrowLink href={siteConfig.github} external>View GitHub</ArrowLink>
              <ArrowLink href="/resume">View résumé</ArrowLink>
            </div>
            <p className="contact-location">{siteConfig.location}</p>
          </div>
        </section>
      </main>
    </>
  );
}
