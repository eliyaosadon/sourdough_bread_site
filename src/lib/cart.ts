"use client";

import { useSyncExternalStore } from "react";
import { getVariant } from "@/lib/products";

// A tiny cart store that lives in the browser and is saved in localStorage.
// useSyncExternalStore is the React-recommended way to read data that lives
// outside React (like localStorage) without hydration bugs.

export type CartLine = { variantId: string; quantity: number };

const STORAGE_KEY = "sourdough-cart-v1";
const EMPTY: readonly CartLine[] = [];

let lines: readonly CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.variantId === "string" &&
    typeof v.quantity === "number" &&
    Number.isInteger(v.quantity) &&
    v.quantity > 0
  );
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      lines = parsed.filter(isLine).filter((l) => getVariant(l.variantId));
    }
  } catch {
    // Corrupted or blocked storage: start with an empty cart.
  }
}

function commit(next: readonly CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked. The cart still works until the page closes.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return lines;
}

function getServerSnapshot() {
  return EMPTY;
}

export function addToCart(variantId: string, quantity = 1) {
  load();
  const found = getVariant(variantId);
  if (!found) return;
  const existing = lines.find((l) => l.variantId === variantId);
  const nextQuantity = Math.min(
    (existing?.quantity ?? 0) + quantity,
    found.variant.stock,
  );
  if (nextQuantity <= 0) return;
  commit(
    existing
      ? lines.map((l) =>
          l.variantId === variantId ? { ...l, quantity: nextQuantity } : l,
        )
      : [...lines, { variantId, quantity: nextQuantity }],
  );
}

export function setQuantity(variantId: string, quantity: number) {
  load();
  const found = getVariant(variantId);
  if (!found) return;
  if (quantity <= 0) {
    commit(lines.filter((l) => l.variantId !== variantId));
    return;
  }
  const clamped = Math.min(quantity, found.variant.stock);
  commit(
    lines.map((l) =>
      l.variantId === variantId ? { ...l, quantity: clamped } : l,
    ),
  );
}

export function removeFromCart(variantId: string) {
  load();
  commit(lines.filter((l) => l.variantId !== variantId));
}

export function clearCart() {
  commit(EMPTY);
}

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = current.reduce((sum, l) => sum + l.quantity, 0);
  return { lines: current, count };
}
