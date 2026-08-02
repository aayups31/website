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
      <main id="main-content" className="page-shell contact-page">
        <section className="contact-page__hero">
          <p className="kicker">Signal open · {siteConfig.location}</p>
          <h1>Start a conversation.</h1>
          <p>
            For software engineering, machine learning, infrastructure, simulation,
            product, or creative-technology work, reach me directly.
          </p>
          <div>
            <ArrowLink href={`mailto:${siteConfig.email}`} external>{siteConfig.email}</ArrowLink>
            <ArrowLink href={siteConfig.github} external>GitHub / aayups31</ArrowLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
