"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";

type VariantOption = {
  id: string;
  label: string;
  priceAgorot: number;
  stock: number;
};

export function AddToCart({ variants }: { variants: VariantOption[] }) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  const soldOut = selected.stock <= 0;
  const maxQuantity = Math.max(1, Math.min(selected.stock, 10));

  function chooseVariant(id: string) {
    setVariantId(id);
    setQuantity(1);
    setAdded(false);
  }

  function handleAdd() {
    addToCart(selected.id, quantity);
    setAdded(true);
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Size</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const active = v.id === selected.id;
            return (
              <label
                key={v.id}
                className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition ${
                  active
                    ? "border-crust bg-crust text-cream"
                    : "border-wheat bg-white text-ink hover:border-crust"
                } ${v.stock <= 0 ? "opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={active}
                  onChange={() => chooseVariant(v.id)}
                  className="sr-only"
                />
                <span className="block font-medium">{v.label}</span>
                <span className="block text-xs opacity-90">
                  {formatPrice(v.priceAgorot)}
                  {v.stock <= 0 ? " - sold out" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {!soldOut && selected.stock <= 3 && (
        <p className="text-sm font-medium text-crust-dark">
          Only {selected.stock} left
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          Quantity
          <select
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setAdded(false);
            }}
            disabled={soldOut}
            className="rounded-lg border border-wheat bg-white px-3 py-2 text-sm font-normal"
          >
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crust-dark disabled:cursor-not-allowed disabled:bg-ink-soft/50"
        >
          {soldOut ? "Sold out" : `Add to cart - ${formatPrice(selected.priceAgorot * quantity)}`}
        </button>
      </div>

      <p aria-live="polite" className="min-h-6 text-sm text-crust-dark">
        {added && (
          <>
            Added to your cart.{" "}
            <Link href="/cart" className="font-semibold underline">
              View cart
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
