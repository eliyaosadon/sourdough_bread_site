import Link from "next/link";
import { LoafArt } from "@/components/LoafArt";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, isSoldOut } from "@/lib/products";
import { SITE } from "@/lib/site";

export default function Home() {
  const featured = getProducts()
    .filter((p) => !isSoldOut(p))
    .slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 rounded-3xl bg-parchment px-6 py-12 sm:px-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-crust">
            Naturally leavened
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-crust-dark sm:text-5xl">
            {SITE.tagline}
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Real sourdough with a crackly crust and a soft, tangy crumb. Every
            loaf ferments for more than 24 hours and is baked to order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crust-dark"
            >
              Shop the breads
            </Link>
            <Link
              href="/advisor"
              className="rounded-full border border-crust px-6 py-3 text-sm font-semibold text-crust-dark transition hover:bg-wheat/40"
            >
              Ask the bread advisor
            </Link>
          </div>
        </div>
        <div className="text-[#d9a066]">
          <LoafArt className="mx-auto w-full max-w-sm" />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold text-crust-dark">
            Fresh this week
          </h2>
          <Link href="/shop" className="text-sm font-medium text-crust underline">
            See all breads
          </Link>
        </div>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-wheat/70 bg-white px-6 py-10 text-center sm:px-12">
        <h2 className="font-serif text-2xl font-semibold text-crust-dark">
          Not sure which loaf to pick?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          Tell our bread advisor what you are cooking, how you like your crumb or
          what you cannot eat, and get suggestions from the real menu.
        </p>
        <Link
          href="/advisor"
          className="mt-5 inline-block rounded-full bg-crust px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crust-dark"
        >
          Chat with the advisor
        </Link>
      </section>
    </div>
  );
}
