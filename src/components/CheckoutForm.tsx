"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { clearCart, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { getVariant } from "@/lib/products";

type Confirmation = { orderId: string; totalAgorot: number };

const inputClass =
  "w-full rounded-lg border border-wheat bg-white px-3 py-2.5 text-sm";

function readError(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const error = (data as { error: unknown }).error;
    if (typeof error === "string") return error;
  }
  return "Something went wrong. Please try again.";
}

function readConfirmation(data: unknown): Confirmation | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.orderId === "string" && typeof d.totalAgorot === "number") {
    return { orderId: d.orderId, totalAgorot: d.totalAgorot };
  }
  return null;
}

export function CheckoutForm() {
  const { lines } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const items = lines.flatMap((line) => {
    const found = getVariant(line.variantId);
    return found ? [{ line, product: found.product, variant: found.variant }] : [];
  });
  const total = items.reduce(
    (sum, i) => sum + i.variant.priceAgorot * i.line.quantity,
    0,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email },
          fulfillment,
          address,
          notes,
          items: lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readError(data));
        return;
      }
      const result = readConfirmation(data);
      if (!result) {
        setError("Something went wrong. Please try again.");
        return;
      }
      clearCart();
      setConfirmation(result);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl bg-parchment p-10 text-center">
        <p className="font-serif text-2xl text-crust-dark">Thank you for your order!</p>
        <p className="mt-3">
          Your order number is{" "}
          <span className="font-mono font-semibold">{confirmation.orderId}</span>
        </p>
        <p className="mt-1 text-ink-soft">
          Total: {formatPrice(confirmation.totalAgorot)}. The bakery will contact you
          to confirm the details. You pay when you receive your bread.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream hover:bg-crust-dark"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-parchment p-10 text-center">
        <p className="font-serif text-xl text-crust-dark">Your cart is empty</p>
        <Link
          href="/shop"
          className="mt-5 inline-block rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream hover:bg-crust-dark"
        >
          Browse the breads
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-wheat/70 bg-white p-5"
      >
        <label className="block text-sm font-semibold">
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            className={`${inputClass} mt-1 font-normal`}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Phone
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
          <label className="block text-sm font-semibold">
            Email (optional)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Receive your order</legend>
          <div className="flex flex-wrap gap-3 text-sm">
            {(["pickup", "delivery"] as const).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-xl border px-4 py-2.5 ${
                  fulfillment === option
                    ? "border-crust bg-crust text-cream"
                    : "border-wheat bg-white hover:border-crust"
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={option}
                  checked={fulfillment === option}
                  onChange={() => setFulfillment(option)}
                  className="sr-only"
                />
                {option === "pickup" ? "Pickup" : "Delivery"}
              </label>
            ))}
          </div>
        </fieldset>

        {fulfillment === "delivery" && (
          <label className="block text-sm font-semibold">
            Delivery address
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              maxLength={200}
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
        )}

        <label className="block text-sm font-semibold">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className={`${inputClass} mt-1 font-normal`}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crust-dark disabled:opacity-60"
        >
          {submitting ? "Placing order..." : `Place order - ${formatPrice(total)}`}
        </button>
        <p className="text-xs text-ink-soft">
          Online payment is coming soon. For now you pay when you receive your order.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-wheat/70 bg-white p-5">
        <h2 className="font-serif text-lg font-semibold text-crust-dark">Your order</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map(({ line, product, variant }) => (
            <li key={line.variantId} className="flex justify-between gap-3">
              <span>
                {line.quantity} x {product.name}{" "}
                <span className="text-ink-soft">({variant.label})</span>
              </span>
              <span className="font-medium">
                {formatPrice(variant.priceAgorot * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-wheat/60 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>
      </aside>
    </div>
  );
}
