"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import BookNowModal from "@/components/BookNowModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/moreprojects", label: "All Projects" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <h1>
          {site.name}
          <span className="brand-tagline">{site.tagline}</span>
        </h1>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${isActive(link.href) ? " active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <BookNowModal />

      <button
        className={`menu-toggle${open ? " open" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <div className={`drawer${open ? " open" : ""}`}>
        <div className="drawer-header">
          <h3>Menu</h3>
          <button
            className="drawer-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className="drawer-nav" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
