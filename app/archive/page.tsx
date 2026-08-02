import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageIntro } from "@/components/page-intro";
import { archiveItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "VFX & Photography",
  description: "A projection archive prepared for Aayu's VFX work and photography.",
};

export default function ArchivePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell archive-page">
        <PageIntro
          index="04"
          eyebrow="VFX / Photography"
          title={<>A different kind of system: the image.</>}
          description="The archive is ready for finished shots, breakdowns, photographic series, credits, and process. Original studies stand in until final media arrives."
        />

        <section className="archive-sequence content-section" aria-label="Visual archive placeholders">
          {archiveItems.map((item, index) => (
            <figure
              className={`archive-item archive-item--${item.aspect}`}
              key={item.id}
            >
              <div className="archive-item__image">
                <img src={item.source} alt={item.alt} />
              </div>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
                <span>{item.category}</span>
                <span>{item.status} · final media pending</span>
              </figcaption>
            </figure>
          ))}
        </section>

        <section className="archive-readiness content-section content-section--quiet">
          <p className="kicker">Prepared for real work</p>
          <h2>Every final item will carry its title, year, context, exact role, tools, credits, accessibility text, and publication permission.</h2>
          <p>No invented client work. No decorative gallery filler.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
