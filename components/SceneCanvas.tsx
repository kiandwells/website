"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Engine } from "@/lib/scenes/Engine";
import { getProject } from "@/lib/site";
import { useCardHover } from "./CardHoverProvider";

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { slug, setSlug } = useCardHover();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(
      canvas,
      (nextSlug) => router.push(`/project-highlight/${nextSlug}`),
      setSlug
    );
    engineRef.current = engine;
    engine.onRouteChange(window.location.pathname);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [router, setSlug]);

  useEffect(() => {
    setSlug(null);
    engineRef.current?.onRouteChange(pathname);
  }, [pathname, setSlug]);

  const hoveredProject = slug ? getProject(slug) : undefined;

  return (
    <>
      <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />
      {pathname === "/" && slug && hoveredProject && (
        <div key={slug} className="card-name" aria-hidden="true">
          <span>{hoveredProject.title}</span>
        </div>
      )}
    </>
  );
}
