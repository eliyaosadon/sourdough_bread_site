import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/AddToCart";
import { LoafArt } from "@/components/LoafArt";
import {
  FLOUR_LABELS,
  TAG_LABELS,
  getProductBySlug,
  getProducts,
} from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Bread not found" };
  return { title: product.name, description: product.tagline };
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense
      fallback={<p className="py-20 text-center text-ink-soft">Loading...</p>}
    >
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/shop" className="text-crust underline">
          All breads
        </Link>
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <div
          className="flex items-center justify-center rounded-3xl bg-parchment p-10"
          style={{ color: product.tone }}
        >
          <LoafArt className="w-full max-w-sm" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-crust-dark">
              {product.name}
            </h1>
            <p className="mt-1 text-lg text-ink-soft">{product.tagline}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              <li className="rounded-full bg-parchment px-2.5 py-1">
                {FLOUR_LABELS[product.flour]}
              </li>
              {product.tags.map((t) => (
                <li key={t} className="rounded-full bg-parchment px-2.5 py-1">
                  {TAG_LABELS[t]}
                </li>
              ))}
            </ul>
          </div>

          <p className="leading-relaxed">{product.description}</p>

          <AddToCart variants={product.variants} />
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border border-wheat/70 bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-crust-dark">
            Ingredients
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {product.ingredients.join(", ")}
          </p>
        </section>
        <section className="rounded-2xl border border-wheat/70 bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-crust-dark">
            Allergens
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Contains: {product.allergens.join(", ")}.
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Baked in a kitchen that also handles nuts, sesame, milk and gluten.
            If you have a serious allergy, please confirm with the bakery before
            ordering.
          </p>
        </section>
        <section className="rounded-2xl border border-wheat/70 bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-crust-dark">
            Storage
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{product.storage}</p>
        </section>
      </div>
    </article>
  );
}
