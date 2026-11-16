"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { SITE } from "@/lib/site";

const linkClass =
  "rounded-full px-3 py-1.5 text-ink transition hover:bg-parchment";

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-wheat/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-crust-dark sm:text-xl"
        >
          {SITE.name}
        </Link>
        <nav
          className="flex items-center gap-1 text-sm font-medium"
          aria-label="Main"
        >
          <Link href="/shop" className={linkClass}>
            Shop
          </Link>
          <Link href="/advisor" className={linkClass}>
            Bread advisor
          </Link>
          <Link
            href="/cart"
            className="ml-1 flex items-center gap-2 rounded-full bg-crust px-3.5 py-1.5 text-cream transition hover:bg-crust-dark"
          >
            Cart
            <span
              className="min-w-5 rounded-full bg-cream px-1.5 text-center text-xs font-semibold text-crust-dark"
              aria-label={`${count} items in cart`}
            >
              {count}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
