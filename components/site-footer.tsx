import Link from "next/link";
import { siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer
      className="site-footer motion-section"
      data-motion-section="footer"
      data-reveal="footer"
    >
      <p className="site-footer__mark" data-motion-copy="footer-mark" data-parallax="0.035">
        APS / {new Date().getFullYear()}
      </p>
      <p data-reveal="copy">
        Built around real work, deliberate motion, and a respect for the person on
        the other side of the screen.
      </p>
      <div className="site-footer__links">
        <a href={`mailto:${siteConfig.email}`} data-magnetic="footer-link" data-motion-copy="link">
          Email
        </a>
        <a
          href={siteConfig.github}
          target="_blank"
          rel="noreferrer"
          data-magnetic="footer-link"
          data-motion-copy="link"
        >
          GitHub
        </a>
        <Link href="/resume" data-magnetic="footer-link" data-motion-copy="link">
          Résumé
        </Link>
      </div>
    </footer>
  );
}
