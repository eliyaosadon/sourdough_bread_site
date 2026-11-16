import type { Metadata } from "next";
import { AdvisorChat } from "@/components/AdvisorChat";

export const metadata: Metadata = {
  title: "Bread advisor",
  description: "Chat with our AI bread advisor to find the right sourdough.",
};

export default function AdvisorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold text-crust-dark">
        Bread advisor
      </h1>
      <p className="mb-6 mt-1 text-ink-soft">
        An AI assistant that knows our menu. It can make mistakes, so for serious
        allergies please confirm with the bakery.
      </p>
      <AdvisorChat />
    </div>
  );
}
