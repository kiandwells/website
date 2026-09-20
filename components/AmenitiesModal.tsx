"use client";

import { useState } from "react";
import { amenities } from "@/lib/site";

export default function AmenitiesModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const active = amenities[selected];

  return (
    <>
      <button className="amenities-toggle" onClick={() => setOpen(true)}>
        Amenities
      </button>

      {open && (
        <div className="amenities-modal-root">
          <div
            className="amenities-backdrop"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            onClick={() => setOpen(false)}
          />
          <div className="amenities-modal" role="dialog" aria-modal="true" aria-label="Amenities">
            <button className="amenities-close" onClick={() => setOpen(false)}>
              ×
            </button>
            <div className="amenities-panel">
              <ul className="amenities-list">
                {amenities.map((amenity, i) => (
                  <li key={amenity.id}>
                    <button
                      className={`amenities-item${i === selected ? " active" : ""}`}
                      onClick={() => setSelected(i)}
                    >
                      {amenity.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="amenities-preview">
                <img
                  key={active.id}
                  className="amenities-image"
                  src={active.image}
                  alt={active.label}
                />
                <p className="amenities-caption">{active.label}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
