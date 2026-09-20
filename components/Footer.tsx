"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="site-footer">
      <ul className="socials">
        {site.socials.map((social) => (
          <li key={social.title}>
            <a href={social.href} target="_blank" rel="noopener noreferrer">
              {social.title}
            </a>
          </li>
        ))}
      </ul>

      <div className="contact-line">
        <button className="email-copy" onClick={copyEmail}>
          {copied ? "Copied to clipboard" : site.email}
        </button>
        <span className="contact-separator">·</span>
        <a className="contact-phone" href={`tel:${site.phone.replace(/\s/g, "")}`}>
          {site.phone}
        </a>
      </div>

      <div className="footer-meta">
        <button className="map-link" onClick={() => setMapOpen(true)}>
          Show on Map
        </button>
        <span className="location">{site.location}</span>
        <span className="credit">{site.credit}</span>
      </div>

      {mapOpen && (
        <div className="map-modal-root">
          <div
            className="map-backdrop"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            onClick={() => setMapOpen(false)}
          />
          <div
            className="map-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Location map"
          >
            <button className="map-modal-close" onClick={() => setMapOpen(false)}>
              ×
            </button>
            <iframe
              className="map-modal-frame"
              src={site.mapEmbedUrl}
              title="Kian Dwells location map"
              loading="lazy"
              allowFullScreen
            />
            <a
              className="map-modal-link"
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      )}
    </footer>
  );
}
