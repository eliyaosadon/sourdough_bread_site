"use client";

import Link from "next/link";
import { removeFromCart, setQuantity, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { getVariant } from "@/lib/products";

export function CartView() {
  const { lines } = useCart();

  const items = lines.flatMap((line) => {
    const found = getVariant(line.variantId);
    return found ? [{ line, product: found.product, variant: found.variant }] : [];
  });
  const total = items.reduce(
    (sum, i) => sum + i.variant.priceAgorot * i.line.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-parchment p-10 text-center">
        <p className="font-serif text-xl text-crust-dark">Your cart is empty</p>
        <p className="mt-2 text-ink-soft">
          Fresh sourdough is waiting for you in the shop.
        </p>
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
      <ul className="divide-y divide-wheat/60 rounded-2xl border border-wheat/70 bg-white">
        {items.map(({ line, product, variant }) => (
          <li key={line.variantId} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${product.slug}`}
                className="font-serif text-lg font-semibold text-crust-dark hover:underline"
              >
                {product.name}
              </Link>
              <p className="text-sm text-ink-soft">
                {variant.label} - {formatPrice(variant.priceAgorot)} each
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="h-8 w-8 rounded-full border border-wheat text-lg leading-none hover:border-crust"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                disabled={line.quantity >= variant.stock}
                aria-label={`Increase quantity of ${product.name}`}
                className="h-8 w-8 rounded-full border border-wheat text-lg leading-none hover:border-crust disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-semibold">
              {formatPrice(variant.priceAgorot * line.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeFromCart(line.variantId)}
              aria-label={`Remove ${product.name} from cart`}
              className="text-sm text-ink-soft underline hover:text-crust-dark"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-wheat/70 bg-white p-5">
        <h2 className="font-serif text-lg font-semibold text-crust-dark">
          Order summary
        </h2>
        <dl className="mt-4 flex items-center justify-between text-base">
          <dt className="font-medium">Total</dt>
          <dd className="font-semibold">{formatPrice(total)}</dd>
        </dl>
        <p className="mt-2 text-xs text-ink-soft">
          Delivery fees, if any, are confirmed by the bakery.
        </p>
        <Link
          href="/checkout"
          className="mt-5 block rounded-full bg-crust px-6 py-3 text-center text-sm font-semibold text-cream hover:bg-crust-dark"
        >
          Continue to checkout
        </Link>
      </aside>
    </div>
  );
}
