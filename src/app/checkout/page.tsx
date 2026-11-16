import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-crust-dark">
        Checkout
      </h1>
      <CheckoutForm />
    </div>
  );
}
