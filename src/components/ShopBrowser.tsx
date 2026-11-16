"use client";

import { useState, type ReactNode } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  FLOURS,
  FLOUR_LABELS,
  TAGS,
  TAG_LABELS,
  type Flour,
  type Product,
  type Tag,
} from "@/lib/products";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-crust bg-crust text-cream"
          : "border-wheat bg-white text-ink hover:border-crust"
      }`}
    >
      {children}
    </button>
  );
}

export function ShopBrowser({ products }: { products: Product[] }) {
  const [flour, setFlour] = useState<Flour | "all">("all");
  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");

  const availableFlours = FLOURS.filter((f) =>
    products.some((p) => p.flour === f),
  );
  const availableTags = TAGS.filter((t) =>
    products.some((p) => p.tags.includes(t)),
  );

  const needle = query.trim().toLowerCase();
  const visible = products.filter((p) => {
    if (flour !== "all" && p.flour !== flour) return false;
    if (!activeTags.every((t) => p.tags.includes(t))) return false;
    if (needle) {
      const haystack = `${p.name} ${p.tagline} ${p.ingredients.join(" ")}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  function toggleTag(tag: Tag) {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    );
  }

  const hasFilters = flour !== "all" || activeTags.length > 0 || needle !== "";

  return (
    <div>
      <div className="space-y-4 rounded-2xl border border-wheat/70 bg-white p-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try olive, seeds, rye..."
            className="w-full rounded-lg border border-wheat bg-cream px-3 py-2 text-sm"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Flour</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={flour === "all"} onClick={() => setFlour("all")}>
              All
            </Chip>
            {availableFlours.map((f) => (
              <Chip key={f} active={flour === f} onClick={() => setFlour(f)}>
                {FLOUR_LABELS[f]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Style</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => (
              <Chip
                key={t}
                active={activeTags.includes(t)}
                onClick={() => toggleTag(t)}
              >
                {TAG_LABELS[t]}
              </Chip>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setFlour("all");
              setActiveTags([]);
              setQuery("");
            }}
            className="text-sm font-medium text-crust underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-ink-soft" aria-live="polite">
        {visible.length} {visible.length === 1 ? "bread" : "breads"}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl bg-parchment p-8 text-center text-ink-soft">
          No breads match these filters. Try removing one, or ask the bread
          advisor for ideas.
        </p>
      )}
    </div>
  );
}
