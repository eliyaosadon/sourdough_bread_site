import type { Metadata } from "next";
import { ShopBrowser } from "@/components/ShopBrowser";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all our handmade sourdough breads.",
};

export default function ShopPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-crust-dark">
        All breads
      </h1>
      <p className="mb-6 mt-1 text-ink-soft">
        Baked in small batches, so some loaves sell out.
      </p>
      <ShopBrowser products={getProducts()} />
    </div>
  );
}
