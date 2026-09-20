"use client";

import { useState, useMemo, type FormEvent } from "react";
import { projects } from "@/lib/site";

const WHATSAPP_NUMBER = "8660544699";

type Errors = Partial<Record<string, string>>;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validate(
  name: string,
  email: string,
  phone: string,
  dateFrom: string,
  dateTo: string,
): Errors {
  const e: Errors = {};

  if (!name.trim()) {
    e.name = "Name is required";
  } else if (name.trim().length < 2) {
    e.name = "Name must be at least 2 characters";
  }

  if (!email.trim()) {
    e.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    e.email = "Enter a valid email address";
  }

  if (!phone.trim()) {
    e.phone = "Contact number is required";
  } else if (!/^\+?[\d\s\-]{10,15}$/.test(phone.trim())) {
    e.phone = "Enter a valid phone number (10–15 digits)";
  }

  if (!dateFrom) {
    e.dateFrom = "Check-in date is required";
  }

  if (!dateTo) {
    e.dateTo = "Check-out date is required";
  } else if (dateFrom && dateTo < dateFrom) {
    e.dateTo = "Check-out must be after check-in";
  }

  return e;
}

export default function BookNowModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState(projects[0].title);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const minDate = useMemo(todayStr, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setProperty(projects[0].title);
    setDateFrom("");
    setDateTo("");
    setErrors({});
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(name, email, phone, dateFrom, dateTo);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const message = [
      `*New Booking Enquiry*`,
      ``,
      `*Name:* ${name.trim()}`,
      `*Email:* ${email.trim()}`,
      `*Phone:* ${phone.trim()}`,
      `*Interested In:* ${property}`,
      `*Check-in:* ${dateFrom}`,
      `*Check-out:* ${dateTo}`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setOpen(false);
  };

  return (
    <>
      <button className="book-now-btn" onClick={handleOpen}>
        Book Now
      </button>

      {open && (
        <div className="booknow-modal-root">
          <div
            className="booknow-backdrop"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            onClick={() => setOpen(false)}
          />
          <div className="booknow-modal" role="dialog" aria-modal="true" aria-label="Book Now">
            <button className="booknow-close" onClick={() => setOpen(false)}>
              ×
            </button>
            <h2 className="booknow-title">Book Now</h2>
            <p className="booknow-subtitle">Fill in the details below and we&apos;ll get in touch via WhatsApp.</p>
            <form className="booknow-form" onSubmit={handleSubmit} noValidate>
              <label className="booknow-field">
                <span className="booknow-label">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
                {errors.name && <span className="booknow-error">{errors.name}</span>}
              </label>

              <label className="booknow-field">
                <span className="booknow-label">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="booknow-error">{errors.email}</span>}
              </label>

              <label className="booknow-field">
                <span className="booknow-label">Contact Number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 8660544699"
                />
                {errors.phone && <span className="booknow-error">{errors.phone}</span>}
              </label>

              <label className="booknow-field">
                <span className="booknow-label">Interested In</span>
                <select value={property} onChange={(e) => setProperty(e.target.value)}>
                  {projects.map((p) => (
                    <option key={p.slug} value={p.title}>
                      {p.title} — {p.tagline}
                    </option>
                  ))}
                </select>
              </label>

              <div className="booknow-date-row">
                <label className="booknow-field">
                  <span className="booknow-label">Check-in</span>
                  <input
                    type="date"
                    value={dateFrom}
                    min={minDate}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      if (dateTo && e.target.value && dateTo < e.target.value) {
                        setDateTo("");
                      }
                    }}
                  />
                  {errors.dateFrom && <span className="booknow-error">{errors.dateFrom}</span>}
                </label>

                <label className="booknow-field">
                  <span className="booknow-label">Check-out</span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || minDate}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                  {errors.dateTo && <span className="booknow-error">{errors.dateTo}</span>}
                </label>
              </div>

              <button type="submit" className="booknow-submit">
                Send on WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
