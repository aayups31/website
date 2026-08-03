import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowLink } from "@/components/arrow-link";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Aayu Pratap Singh for software engineering, ML, product, systems, or creative-technology work.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell contact-page"
        data-motion-route="contact"
      >
        <section
          className="contact-page__hero motion-section"
          data-motion-section="contact-hero"
          data-reveal="section"
        >
          <p className="kicker" data-reveal="meta" data-parallax="0.035">
            Signal open · {siteConfig.location}
          </p>
          <h1
            className="kinetic-heading kinetic-heading--contact"
            data-motion-copy="heading"
            data-reveal="heading"
            data-parallax="-0.075"
            data-magnetic="heading"
          >
            <span className="kinetic-heading__line">Start a conversation.</span>
          </h1>
          <p data-reveal="copy" data-parallax="0.025">
            For software engineering, machine learning, infrastructure, simulation,
            product, or creative-technology work, reach me directly.
          </p>
          <div data-reveal="actions">
            <ArrowLink href={`mailto:${siteConfig.email}`} external>{siteConfig.email}</ArrowLink>
            <ArrowLink href={siteConfig.github} external>GitHub / aayups31</ArrowLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
