import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getVariant } from "@/lib/products";

export type OrderItem = {
  variantId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPriceAgorot: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "pending";
  customer: { name: string; phone: string; email: string };
  fulfillment: "pickup" | "delivery";
  address: string;
  notes: string;
  items: OrderItem[];
  totalAgorot: number;
};

type ParseResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Validates the raw request body and builds a trusted order.
 * Important idea: prices and names are looked up on the server from the catalog.
 * We never trust prices sent by the browser.
 */
export function buildOrder(body: unknown): ParseResult {
  const data = asRecord(body);
  const customerData = asRecord(data.customer);

  const name = text(customerData.name, 80);
  const phone = text(customerData.phone, 30);
  const email = text(customerData.email, 120);
  const address = text(data.address, 200);
  const notes = text(data.notes, 500);
  const fulfillment = data.fulfillment === "delivery" ? "delivery" : "pickup";

  if (name.length < 2) return { ok: false, error: "Please enter your name." };

  const phoneDigits = phone.replace(/[\s\-+()]/g, "");
  if (!/^\d{7,15}$/.test(phoneDigits)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (fulfillment === "delivery" && address.length < 5) {
    return { ok: false, error: "Please enter a delivery address." };
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (data.items.length > 30) {
    return { ok: false, error: "Too many items in one order." };
  }

  const quantities = new Map<string, number>();
  for (const raw of data.items) {
    const item = asRecord(raw);
    const variantId = typeof item.variantId === "string" ? item.variantId : "";
    const quantity = item.quantity;
    if (
      !variantId ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return { ok: false, error: "One of the items in your cart is invalid." };
    }
    quantities.set(variantId, (quantities.get(variantId) ?? 0) + quantity);
  }

  const items: OrderItem[] = [];
  for (const [variantId, quantity] of quantities) {
    const found = getVariant(variantId);
    if (!found) {
      return { ok: false, error: "One of the breads is no longer available." };
    }
    if (quantity > found.variant.stock) {
      return {
        ok: false,
        error:
          found.variant.stock > 0
            ? `Only ${found.variant.stock} left of ${found.product.name} (${found.variant.label}).`
            : `${found.product.name} (${found.variant.label}) is sold out.`,
      };
    }
    items.push({
      variantId,
      productName: found.product.name,
      variantLabel: found.variant.label,
      quantity,
      unitPriceAgorot: found.variant.priceAgorot,
    });
  }

  const totalAgorot = items.reduce(
    (sum, i) => sum + i.unitPriceAgorot * i.quantity,
    0,
  );

  return {
    ok: true,
    order: {
      id: `SB-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      customer: { name, phone, email },
      fulfillment,
      address: fulfillment === "delivery" ? address : "",
      notes,
      items,
      totalAgorot,
    },
  };
}

/**
 * Temporary storage: appends the order to .data/orders.jsonl (ignored by Git).
 * This only works on a normal server or your own computer. When we add PostgreSQL
 * in Phase 3 this function is replaced by a database insert.
 * If writing fails we still log the order so it is not silently lost.
 */
export async function saveOrder(order: Order): Promise<void> {
  try {
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "orders.jsonl"),
      JSON.stringify(order) + "\n",
      "utf8",
    );
  } catch (error) {
    console.error("Could not write the order to disk:", error);
    console.log("ORDER (not persisted):", JSON.stringify(order));
  }
}
