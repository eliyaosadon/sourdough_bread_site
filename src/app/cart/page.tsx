import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-crust-dark">
        Your cart
      </h1>
      <CartView />
    </div>
  );
}
