import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/arrow-link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { projectBySlug, projects } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell project-case"
        data-motion-route="project-case"
        data-project-case={project.slug}
      >
        <header
          className="case-hero motion-section"
          data-motion-section="case-hero"
          data-reveal="section"
        >
          <div className="case-hero__meta" data-reveal="meta" data-parallax="0.04">
            <span>{project.index}</span>
            <span>{project.category}</span>
            <span>{project.status}</span>
          </div>
          <h1
            className="kinetic-heading kinetic-heading--case"
            data-motion-copy="heading"
            data-reveal="heading"
            data-parallax="-0.085"
            data-magnetic="heading"
          >
            <span className="kinetic-heading__line">{project.title}</span>
          </h1>
          <p className="case-hero__lead" data-reveal="copy" data-parallax="0.025">
            {project.lead}
          </p>
          <div className="case-hero__facts" data-reveal="meta">
            <span>{project.period}</span>
            <span>{project.stack.join(" · ")}</span>
          </div>
        </header>

        <section
          className="case-statement motion-section"
          data-motion-section="case-overview"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Overview</p>
          <p data-motion-copy="statement" data-reveal="copy" data-parallax="-0.035">
            {project.summary}
          </p>
        </section>

        <section className="case-sequence motion-section" data-motion-section="case-sequence">
          <article className="motion-section" data-motion-section="case-step" data-reveal="article">
            <span>01</span>
            <p className="kicker" data-reveal="meta">The problem</p>
            <h2
              className="kinetic-heading kinetic-heading--case-step"
              data-motion-copy="heading"
              data-reveal="heading"
              data-parallax="-0.03"
            >
              {project.problem}
            </h2>
          </article>
          <article className="motion-section" data-motion-section="case-step" data-reveal="article">
            <span>02</span>
            <p className="kicker" data-reveal="meta">The approach</p>
            <h2
              className="kinetic-heading kinetic-heading--case-step"
              data-motion-copy="heading"
              data-reveal="heading"
              data-parallax="0.03"
            >
              {project.approach}
            </h2>
          </article>
          <article className="motion-section" data-motion-section="case-step" data-reveal="article">
            <span>03</span>
            <p className="kicker" data-reveal="meta">Current outcome</p>
            <h2
              className="kinetic-heading kinetic-heading--case-step"
              data-motion-copy="heading"
              data-reveal="heading"
              data-parallax="-0.03"
            >
              {project.outcome}
            </h2>
          </article>
        </section>

        <section
          className="case-evidence content-section motion-section"
          data-motion-section="case-evidence"
          data-reveal="section"
        >
          <div className="section-heading">
            <p className="kicker" data-reveal="meta">Evidence</p>
            <h2
              className="kinetic-heading kinetic-heading--section"
              data-motion-copy="heading"
              data-reveal="heading"
            >
              What exists in the work.
            </h2>
          </div>
          <ol>
            {project.evidence.map((item, index) => (
              <li key={item} data-reveal="list-item" data-reveal-index={index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
          {project.note ? <p className="case-note" data-reveal="copy">{project.note}</p> : null}
          {project.externalUrl ? (
            <ArrowLink href={project.externalUrl} external>Visit the live project</ArrowLink>
          ) : null}
        </section>

        <section
          className="next-project motion-section"
          data-motion-section="next-project"
          data-reveal="section"
          data-project-next={nextProject.slug}
        >
          <p className="kicker" data-reveal="meta">Next project</p>
          <ArrowLink href={`/projects/${nextProject.slug}`}>{nextProject.title}</ArrowLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
