"use client";

import Image from "next/image";

export default function HomePage() {
  return (
    <>
      {/* Background photo layer — sits above canvas, behind 3D cards */}
      <div className="home-bg" aria-hidden="true">
        <Image
          src="/kiandwells.jpg"
          alt=""
          fill
          priority
          className="home-bg-img"
          sizes="100vw"
        />
      </div>

      {/* Dark overlay between photo and 3D canvas — makes cards pop */}
      <div className="home-dark-overlay" aria-hidden="true" />
      <div className="home-brand-text" aria-hidden="true">
        <span>Kian Dwells</span>
      </div>

      <div className="page-overlay home-overlay">
        <div className="home-hero-label" aria-hidden="true">
          <span className="home-hero-tagline">Explore</span>
        </div>
      </div>
    </>
  );
}
