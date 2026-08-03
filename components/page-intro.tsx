import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  index: string;
};

export function PageIntro({ eyebrow, title, description, index }: PageIntroProps) {
  return (
    <section
      className="page-intro motion-section"
      aria-labelledby="page-title"
      data-motion-section="page-intro"
      data-reveal="section"
    >
      <div className="page-intro__meta" data-reveal="meta" data-parallax="0.04">
        <span>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h1
        id="page-title"
        className="kinetic-heading kinetic-heading--page"
        data-motion-copy="heading"
        data-reveal="heading"
        data-parallax="-0.08"
      >
        <span className="kinetic-heading__line">{title}</span>
      </h1>
      <p data-reveal="copy" data-parallax="0.025">{description}</p>
      <div className="page-intro__line" aria-hidden="true" data-reveal="line" />
    </section>
  );
}
