"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CardHoverContextValue = {
  slug: string | null;
  setSlug: (slug: string | null) => void;
};

const CardHoverContext = createContext<CardHoverContextValue | null>(null);

export function CardHoverProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const value = useMemo(() => ({ slug, setSlug }), [slug]);
  return <CardHoverContext.Provider value={value}>{children}</CardHoverContext.Provider>;
}

export function useCardHover(): CardHoverContextValue {
  const ctx = useContext(CardHoverContext);
  if (!ctx) throw new Error("useCardHover must be used within a CardHoverProvider");
  return ctx;
}
