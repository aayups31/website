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
      <main id="main-content" className="page-shell project-case">
        <header className="case-hero">
          <div className="case-hero__meta">
            <span>{project.index}</span>
            <span>{project.category}</span>
            <span>{project.status}</span>
          </div>
          <h1>{project.title}</h1>
          <p className="case-hero__lead">{project.lead}</p>
          <div className="case-hero__facts">
            <span>{project.period}</span>
            <span>{project.stack.join(" · ")}</span>
          </div>
        </header>

        <section className="case-statement">
          <p className="kicker">Overview</p>
          <p>{project.summary}</p>
        </section>

        <section className="case-sequence">
          <article>
            <span>01</span>
            <p className="kicker">The problem</p>
            <h2>{project.problem}</h2>
          </article>
          <article>
            <span>02</span>
            <p className="kicker">The approach</p>
            <h2>{project.approach}</h2>
          </article>
          <article>
            <span>03</span>
            <p className="kicker">Current outcome</p>
            <h2>{project.outcome}</h2>
          </article>
        </section>

        <section className="case-evidence content-section">
          <div className="section-heading">
            <p className="kicker">Evidence</p>
            <h2>What exists in the work.</h2>
          </div>
          <ol>
            {project.evidence.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
          {project.note ? <p className="case-note">{project.note}</p> : null}
          {project.externalUrl ? (
            <ArrowLink href={project.externalUrl} external>Visit the live project</ArrowLink>
          ) : null}
        </section>

        <section className="next-project">
          <p className="kicker">Next project</p>
          <ArrowLink href={`/projects/${nextProject.slug}`}>{nextProject.title}</ArrowLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
