import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-wheat/60 bg-parchment">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-base font-semibold text-crust-dark">
            {SITE.name}
          </p>
          <p>{SITE.tagline}</p>
        </div>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href="/shop" className="hover:text-crust-dark">
            Shop
          </Link>
          <Link href="/advisor" className="hover:text-crust-dark">
            Bread advisor
          </Link>
          <Link href="/cart" className="hover:text-crust-dark">
            Cart
          </Link>
        </nav>
      </div>
    </footer>
  );
}
