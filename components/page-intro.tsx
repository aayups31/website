import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  index: string;
};

export function PageIntro({ eyebrow, title, description, index }: PageIntroProps) {
  return (
    <section className="page-intro" aria-labelledby="page-title">
      <div className="page-intro__meta">
        <span>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
      <div className="page-intro__line" aria-hidden="true" />
    </section>
  );
}
