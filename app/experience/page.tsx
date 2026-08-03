import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageIntro } from "@/components/page-intro";
import { ArrowLink } from "@/components/arrow-link";
import { experience } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experience",
  description: "Experience across product engineering, machine learning, and infrastructure.",
};

export default function ExperiencePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell" data-motion-route="experience">
        <PageIntro
          index="01"
          eyebrow="Experience"
          title={<>Product, models, and infrastructure.</>}
          description="I’ve worked from the interface a user touches to the network a team depends on—learning the full system and owning the result."
        />

        <section
          className="editorial-list content-section motion-section"
          aria-label="Professional experience"
          data-motion-section="experience-list"
        >
          {experience.map((item, index) => (
            <article
              className="editorial-entry motion-section"
              key={item.id}
              id={item.id}
              data-motion-section="experience-entry"
              data-reveal="article"
              data-reveal-index={index}
            >
              <div className="editorial-entry__index" data-parallax="0.045">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="editorial-entry__title">
                <p className="kicker" data-reveal="meta">{item.discipline}</p>
                <h2
                  className="kinetic-heading kinetic-heading--entry"
                  data-motion-copy="heading"
                  data-reveal="heading"
                  data-magnetic="heading"
                >
                  {item.organisation}
                </h2>
                <p data-reveal="copy">{item.role}</p>
              </div>
              <div className="editorial-entry__body">
                <div className="editorial-entry__date" data-reveal="meta">
                  <span>{item.period}</span>
                  {item.status ? <span>{item.status}</span> : null}
                </div>
                <p className="editorial-entry__summary" data-reveal="copy">
                  {item.summary}
                </p>
                <ul data-reveal="list">
                  {item.evidence.map((line, evidenceIndex) => (
                    <li key={line} data-reveal="list-item" data-reveal-index={evidenceIndex}>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="stack-line" data-motion-copy="meta" data-reveal="meta">
                  {item.stack.join(" · ")}
                </p>
                {item.href ? <ArrowLink href={item.href}>View related work</ArrowLink> : null}
              </div>
            </article>
          ))}
        </section>

        <section
          className="content-section education-band motion-section"
          data-motion-section="education"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Education</p>
          <h2
            className="kinetic-heading kinetic-heading--section"
            data-motion-copy="heading"
            data-reveal="heading"
            data-parallax="-0.035"
          >
            University of Waterloo
          </h2>
          <div data-reveal="copy">
            <p>Bachelor of Computer Science, Honours, Co-op</p>
            <p>September 2024 — April 2029 (expected)</p>
            <p>Waterloo, Ontario</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
