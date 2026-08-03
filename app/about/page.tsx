import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageIntro } from "@/components/page-intro";
import { ArrowLink } from "@/components/arrow-link";
import { values } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Aayu Pratap Singh — curious across systems, sport, and image.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell" data-motion-route="about">
        <PageIntro
          index="03"
          eyebrow="About"
          title={<>Curious across systems, sport, and image.</>}
          description="I study Computer Science at the University of Waterloo and work across product engineering, machine learning, infrastructure, simulation, and visual storytelling."
        />

        <section
          className="about-statement content-section motion-section"
          data-motion-section="about-statement"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Perspective</p>
          <p data-motion-copy="statement" data-reveal="copy" data-parallax="-0.035">
            I’m drawn to systems in motion: a football match shaped before kickoff,
            a race changing lap by lap, a network carrying pressure, and an image
            deciding how a scene feels. Different subjects, but the same curiosity—
            how small decisions change the whole experience.
          </p>
        </section>

        <section
          className="values-editorial content-section content-section--quiet motion-section"
          data-motion-section="values"
        >
          {values.map((value, index) => (
            <article key={value.index} data-reveal="article" data-reveal-index={index}>
              <span>{value.index}</span>
              <h2
                className="kinetic-heading kinetic-heading--section"
                data-motion-copy="heading"
                data-magnetic="heading"
              >
                {value.title}
              </h2>
              <p data-reveal="copy">{value.copy}</p>
            </article>
          ))}
        </section>

        <section
          className="about-outro content-section motion-section"
          data-motion-section="about-outro"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta">Next</p>
          <h2
            className="kinetic-heading kinetic-heading--statement"
            data-motion-copy="heading"
            data-reveal="heading"
            data-parallax="-0.045"
          >
            Interested in work across software, ML, product, systems, and creative technology.
          </h2>
          <ArrowLink href="/contact">Start a conversation</ArrowLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
