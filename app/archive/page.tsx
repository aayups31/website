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
      <main
        id="main-content"
        className="page-shell archive-page"
        data-motion-route="archive"
      >
        <PageIntro
          index="04"
          eyebrow="VFX / Photography"
          title={<>A different kind of system: the image.</>}
          description="The archive is ready for finished shots, breakdowns, photographic series, credits, and process. Original studies stand in until final media arrives."
        />

        <section
          className="archive-sequence content-section motion-section"
          aria-label="Visual archive placeholders"
          data-motion-section="archive-sequence"
        >
          {archiveItems.map((item, index) => (
            <figure
              className={`archive-item archive-item--${item.aspect}`}
              key={item.id}
              data-archive-item={item.id}
              data-reveal="media"
              data-reveal-index={index}
              data-magnetic="media"
            >
              <div
                className="archive-item__image"
                data-parallax={index % 2 === 0 ? "0.065" : "-0.065"}
              >
                <img src={item.source} alt={item.alt} />
              </div>
              <figcaption data-reveal="caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong data-motion-copy="archive-title">{item.title}</strong>
                <span>{item.category}</span>
                <span>{item.status} · final media pending</span>
              </figcaption>
            </figure>
          ))}
        </section>

        <section
          className="archive-readiness content-section content-section--quiet motion-section"
          data-motion-section="archive-readiness"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Prepared for real work</p>
          <h2
            className="kinetic-heading kinetic-heading--statement"
            data-motion-copy="heading"
            data-reveal="heading"
            data-parallax="-0.04"
          >
            Every final item will carry its title, year, context, exact role, tools,
            credits, accessibility text, and publication permission.
          </h2>
          <p data-reveal="copy">No invented client work. No decorative gallery filler.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
