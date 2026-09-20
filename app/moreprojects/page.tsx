import Link from "next/link";
import { projects } from "@/lib/site";

export default function MoreProjectsPage() {
  return (
    <div className="page-overlay moreprojects-overlay">
      <div className="glass-panel" style={{ width: "min(520px, 100%)", pointerEvents: "auto" }}>
        <h2 className="page-title">All Projects</h2>
        <ul className="project-links" style={{ marginTop: "1.5rem" }}>
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/project-highlight/${project.slug}`}>
                <span className="project-link-title">{project.title}</span>
                <span className="project-link-tagline">{project.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
