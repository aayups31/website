import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  return (
    <ol className="project-index" aria-label="Selected projects">
      {projects.map((project) => (
        <li key={project.slug}>
          <Link href={`/projects/${project.slug}`}>
            <span className="project-index__number">{project.index}</span>
            <span className="project-index__title">
              <strong>{project.title}</strong>
              <span>{project.lead}</span>
            </span>
            <span className="project-index__meta">
              {project.category}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
