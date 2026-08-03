import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageIntro } from "@/components/page-intro";
import { ProjectIndex } from "@/components/project-index";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected systems across simulation, full-stack product engineering, ML, and creative technology.",
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell" data-motion-route="projects">
        <PageIntro
          index="02"
          eyebrow="Selected projects"
          title={<>Systems in motion.</>}
          description="Products and prototypes built around data, decisions, ownership, and real-time behaviour. Ongoing work is labeled without invented outcomes."
        />
        <section
          className="content-section content-section--quiet motion-section"
          data-motion-section="projects-index"
          data-reveal="section"
        >
          <ProjectIndex projects={projects} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
