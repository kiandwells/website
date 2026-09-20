import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/site";
import { projectGalleryImages } from "@/lib/projectImages";
import AmenitiesModal from "@/components/AmenitiesModal";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectHighlightPage(props: Props) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const gallery = projectGalleryImages(slug);

  return (
    <div className="page-overlay highlight-overlay">
      <div className="glass-panel" style={{ pointerEvents: "auto", maxWidth: "420px" }}>
        <Link href="/" className="back-link">
          ← All projects
        </Link>
        <h2 className="page-title" style={{ marginTop: "0.75rem" }}>{project.title}</h2>
        <p className="page-subtitle">{project.tagline}</p>
        <div style={{ marginTop: "1.25rem" }}>
          <AmenitiesModal />
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="project-gallery" aria-hidden="true">
          <div className="project-gallery-track">
            {[...gallery, ...gallery].map((src, i) => (
              <div key={i} className="project-gallery-item">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="200px"
                  className="project-gallery-img"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
