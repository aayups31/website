import Link from "next/link";
import { siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__mark">APS / {new Date().getFullYear()}</p>
      <p>
        Built around real work, deliberate motion, and a respect for the person on
        the other side of the screen.
      </p>
      <div className="site-footer__links">
        <a href={`mailto:${siteConfig.email}`}>Email</a>
        <a href={siteConfig.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link href="/resume">Résumé</Link>
      </div>
    </footer>
  );
}
