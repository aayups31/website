import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  return (
    <ol
      className="project-index"
      aria-label="Selected projects"
      data-motion-section="project-index"
    >
      {projects.map((project, index) => (
        <li
          key={project.slug}
          data-project-item={project.slug}
          data-project-index={index}
          data-reveal="project"
        >
          <Link
            href={`/projects/${project.slug}`}
            data-project-link={project.slug}
            data-project-category={project.category}
            data-magnetic="project"
          >
            <span className="project-index__number" data-parallax="0.05">
              {project.index}
            </span>
            <span className="project-index__title">
              <strong
                className="kinetic-heading kinetic-heading--project"
                data-motion-copy="project-title"
              >
                {project.title}
              </strong>
              <span data-reveal="copy">{project.lead}</span>
            </span>
            <span className="project-index__meta" data-motion-copy="project-meta">
              {project.category}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
