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
      <main id="main-content" className="page-shell">
        <PageIntro
          index="01"
          eyebrow="Experience"
          title={<>Product, models, and infrastructure.</>}
          description="I’ve worked from the interface a user touches to the network a team depends on—learning the full system and owning the result."
        />

        <section className="editorial-list content-section" aria-label="Professional experience">
          {experience.map((item, index) => (
            <article className="editorial-entry" key={item.id} id={item.id}>
              <div className="editorial-entry__index">{String(index + 1).padStart(2, "0")}</div>
              <div className="editorial-entry__title">
                <p className="kicker">{item.discipline}</p>
                <h2>{item.organisation}</h2>
                <p>{item.role}</p>
              </div>
              <div className="editorial-entry__body">
                <div className="editorial-entry__date">
                  <span>{item.period}</span>
                  {item.status ? <span>{item.status}</span> : null}
                </div>
                <p className="editorial-entry__summary">{item.summary}</p>
                <ul>
                  {item.evidence.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <p className="stack-line">{item.stack.join(" · ")}</p>
                {item.href ? <ArrowLink href={item.href}>View related work</ArrowLink> : null}
              </div>
            </article>
          ))}
        </section>

        <section className="content-section education-band">
          <p className="kicker">Education</p>
          <h2>University of Waterloo</h2>
          <div>
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
