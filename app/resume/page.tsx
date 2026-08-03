import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageIntro } from "@/components/page-intro";
import { ArrowLink } from "@/components/arrow-link";
import { experience, projects, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Aayu Pratap Singh's accessible résumé in product engineering, ML, infrastructure, and simulation.",
};

const skillGroups = [
  ["Languages", "Python · C · C++ · JavaScript · TypeScript · SQL · HTML · CSS"],
  ["Product / web", "Next.js · React · Node.js · Express · Flask · Supabase · PostgreSQL · MongoDB"],
  ["ML / data", "PyTorch · TensorFlow · Pandas · NumPy · SciPy"],
  ["Delivery", "Git · Docker · Vercel · Playwright · Vitest · REST APIs"],
  ["Infrastructure", "Cisco CLI · Catalyst 9200 · Catalyst 9800 WLC · Meraki · Infoblox"],
];

export default function ResumePage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell resume-page"
        data-motion-route="resume"
      >
        <PageIntro
          index="05"
          eyebrow="Résumé"
          title={<>Engineering across the stack.</>}
          description="A privacy-conscious HTML résumé covering product engineering, machine learning, network infrastructure, and simulation."
        />

        <section
          className="resume-contact content-section motion-section"
          data-motion-section="resume-contact"
          data-reveal="section"
        >
          <p data-reveal="meta">{siteConfig.location}</p>
          <a href={`mailto:${siteConfig.email}`} data-magnetic="link" data-motion-copy="link">
            {siteConfig.email}
          </a>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            data-magnetic="link"
            data-motion-copy="link"
          >
            github.com/aayups31
          </a>
          <p className="resume-privacy" data-reveal="copy">
            The public résumé intentionally omits a phone number.
          </p>
        </section>

        <section
          className="resume-section content-section motion-section"
          data-motion-section="resume-education"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Education</p>
          <div className="resume-row" data-reveal="row">
            <h2
              className="kinetic-heading kinetic-heading--row"
              data-motion-copy="heading"
            >
              University of Waterloo
            </h2>
            <p>Bachelor of Computer Science, Honours, Co-op</p>
            <p>Sep 2024 — Apr 2029 (expected)</p>
          </div>
        </section>

        <section
          className="resume-section content-section content-section--quiet motion-section"
          data-motion-section="resume-experience"
        >
          <p className="kicker" data-reveal="meta">Experience</p>
          {experience.map((item, index) => (
            <div className="resume-row" key={item.id} data-reveal="row" data-reveal-index={index}>
              <h2
                className="kinetic-heading kinetic-heading--row"
                data-motion-copy="heading"
              >
                {item.organisation}
              </h2>
              <p>{item.role}</p>
              <p>{item.period}</p>
              <ul>{item.evidence.map((line) => <li key={line}>{line}</li>)}</ul>
            </div>
          ))}
        </section>

        <section
          className="resume-section content-section motion-section"
          data-motion-section="resume-projects"
        >
          <p className="kicker" data-reveal="meta">Selected projects</p>
          {projects.filter((project) => project.slug !== "unimarket").map((project, index) => (
            <div
              className="resume-row"
              key={project.slug}
              data-project-item={project.slug}
              data-reveal="row"
              data-reveal-index={index}
            >
              <h2
                className="kinetic-heading kinetic-heading--row"
                data-motion-copy="project-title"
              >
                {project.title}
              </h2>
              <p>{project.period}</p>
              <p>{project.summary}</p>
            </div>
          ))}
        </section>

        <section
          className="resume-section content-section content-section--quiet motion-section"
          data-motion-section="resume-skills"
        >
          <p className="kicker" data-reveal="meta">Technical range</p>
          {skillGroups.map(([label, skills], index) => (
            <div className="skills-row" key={label} data-reveal="row" data-reveal-index={index}>
              <h2
                className="kinetic-heading kinetic-heading--row"
                data-motion-copy="heading"
              >
                {label}
              </h2>
              <p>{skills}</p>
            </div>
          ))}
          <ArrowLink href="/contact">Request a PDF copy</ArrowLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
