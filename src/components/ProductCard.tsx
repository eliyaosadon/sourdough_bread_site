import Link from "next/link";
import { LoafArt } from "@/components/LoafArt";
import { formatPrice } from "@/lib/money";
import {
  FLOUR_LABELS,
  fromPrice,
  isSoldOut,
  type Product,
} from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = isSoldOut(product);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-wheat/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="relative bg-parchment px-8 pb-4 pt-8"
        style={{ color: product.tone }}
      >
        <LoafArt className="mx-auto h-28 w-auto transition group-hover:scale-105" />
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-cream">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-serif text-lg font-semibold text-crust-dark">
          {product.name}
        </h3>
        <p className="text-sm text-ink-soft">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-semibold">
            From {formatPrice(fromPrice(product))}
          </span>
          <span className="rounded-full bg-parchment px-2 py-0.5 text-xs text-ink-soft">
            {FLOUR_LABELS[product.flour]}
          </span>
        </div>
      </div>
    </Link>
  );
}
