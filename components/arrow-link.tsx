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
      >
        <span>{children}</span>
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
