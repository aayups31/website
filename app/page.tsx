import { ExperienceLoader } from "@/components/experience/experience-loader";
import { SiteHeader } from "@/components/site-header";
import { ArrowLink } from "@/components/arrow-link";
import { experience, projects, siteConfig, values } from "@/lib/content";

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
          id="perspective"
          className="world-chapter world-chapter--psychological"
          data-world="psychological"
          aria-labelledby="perspective-title"
        >
          <div className="world-intro world-copy world-copy--left">
            <p className="chapter-label"><span>03</span> Perspective</p>
            <h2 id="perspective-title">The person behind the systems.</h2>
            <p>
              I’m drawn to systems in motion: a football match shaped before kickoff,
              a race changing lap by lap, a network carrying pressure, and an image
              deciding how a scene feels.
            </p>
          </div>

          <article className="world-beat world-beat--right values-beat">
            <div className="world-copy values-sequence">
              {values.map((value) => (
                <div key={value.index}>
                  <span>{value.index}</span>
                  <h3>{value.title}</h3>
                  <p>{value.copy}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="world-closing world-copy world-copy--left">
            <p className="closing-line">
              Studying Computer Science at the University of Waterloo. Interested in
              software, machine learning, product, systems, and creative technology.
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
              A projection archive for VFX work and photography. The structure is
              ready; final media, roles, credits, and breakdowns will replace these
              original placeholder studies when supplied.
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
              <p className="placeholder-caption">Placeholder frame · Final media pending</p>
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
              <p className="placeholder-caption">Placeholder study · Final photographs pending</p>
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
