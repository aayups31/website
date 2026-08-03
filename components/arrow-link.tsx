import Link from "next/link";
import type { ReactNode } from "react";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

export function ArrowLink({
  href,
  children,
  external = false,
  className = "",
}: ArrowLinkProps) {
  const classes = `arrow-link ${className}`.trim();

  if (external) {
    const opensNewTab = /^https?:\/\//.test(href);
    return (
      <a
        className={classes}
        href={href}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noreferrer" : undefined}
        data-magnetic="link"
        data-reveal="link"
      >
        <span className="arrow-link__label">
          <span className="arrow-link__label-current">{children}</span>
          <span className="arrow-link__label-next" aria-hidden="true">{children}</span>
        </span>
        <span className="arrow-link__arrow" aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link className={classes} href={href} data-magnetic="link" data-reveal="link">
      <span className="arrow-link__label">
        <span className="arrow-link__label-current">{children}</span>
        <span className="arrow-link__label-next" aria-hidden="true">{children}</span>
      </span>
      <span className="arrow-link__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
