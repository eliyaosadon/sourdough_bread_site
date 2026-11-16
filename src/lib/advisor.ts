import { SITE } from "@/lib/site";
import {
  FLOURS,
  FLOUR_LABELS,
  TAGS,
  fromPrice,
  getProductBySlug,
  getProducts,
  getVariant,
  type Product,
} from "@/lib/products";

export const SYSTEM_PROMPT = `You are the bread advisor for ${SITE.name}, an online sourdough bakery. You help customers choose breads from the shop's real catalog.

Rules:
- Use the tools to look up products, ingredients, allergens, prices and stock. Never invent breads, ingredients, prices or availability. If the tools do not return something, say you do not know.
- Only recommend breads that the tools return. When you recommend one, write its page path exactly as /shop/<slug> so the customer can open it.
- Allergens: report only what the product data lists. You cannot guarantee that a bread is free of an allergen or safe for a medical condition, and cross-contact with other ingredients is possible. For serious allergies, tell the customer to confirm with the bakery before ordering.
- Do not give medical advice or health claims.
- Stay on topic: breads, pairings, storage, serving ideas and ordering from this shop. Politely decline anything else.
- Keep replies short and friendly, under 120 words unless the customer asks for more. Reply in the customer's language (for example English or Hebrew).
- Prices are in Israeli shekels (ILS).`;

export const ADVISOR_TOOLS = [
  {
    name: "search_products",
    description:
      "Search the bread catalog. All filters are optional. Returns a short list of matching breads with their slug, flour type, tags, allergens, starting price and availability.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Free text matched against name, description, ingredients and tags, for example 'olive' or 'seeds'.",
        },
        flour: { type: "string", enum: FLOURS },
        tag: { type: "string", enum: TAGS },
        max_price_ils: {
          type: "number",
          description: "Only breads whose starting price is at most this many shekels.",
        },
      },
    },
  },
  {
    name: "get_product",
    description:
      "Get full details of one bread by slug: description, ingredients, allergens, storage tips and every size with its price and stock.",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "check_stock",
    description:
      "Check how many units are left of one size (variant) of a bread. Use the variant id returned by get_product.",
    input_schema: {
      type: "object",
      properties: { variant_id: { type: "string" } },
      required: ["variant_id"],
    },
  },
] as const;

function summary(product: Product) {
  return {
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    flour: FLOUR_LABELS[product.flour],
    tags: product.tags,
    allergens: product.allergens,
    from_price_ils: fromPrice(product) / 100,
    in_stock: product.variants.some((v) => v.stock > 0),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

/** Runs one tool call requested by the model and returns a JSON-friendly result. */
export function runTool(name: string, input: unknown): unknown {
  const args = asRecord(input);

  if (name === "search_products") {
    const query =
      typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
    const flour = typeof args.flour === "string" ? args.flour : "";
    const tag = typeof args.tag === "string" ? args.tag : "";
    const maxPrice =
      typeof args.max_price_ils === "number" ? args.max_price_ils * 100 : null;

    const results = getProducts().filter((p) => {
      if (flour && p.flour !== flour) return false;
      if (tag && !p.tags.some((t) => t === tag)) return false;
      if (maxPrice !== null && fromPrice(p) > maxPrice) return false;
      if (query) {
        const haystack = [
          p.name,
          p.tagline,
          p.description,
          p.ingredients.join(" "),
          p.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return { count: results.length, products: results.slice(0, 8).map(summary) };
  }

  if (name === "get_product") {
    const slug = typeof args.slug === "string" ? args.slug : "";
    const product = getProductBySlug(slug);
    if (!product) return { error: "No bread with that slug." };
    return {
      ...summary(product),
      description: product.description,
      ingredients: product.ingredients,
      storage: product.storage,
      page: `/shop/${product.slug}`,
      variants: product.variants.map((v) => ({
        variant_id: v.id,
        label: v.label,
        price_ils: v.priceAgorot / 100,
        stock: v.stock,
      })),
    };
  }

  if (name === "check_stock") {
    const variantId = typeof args.variant_id === "string" ? args.variant_id : "";
    const found = getVariant(variantId);
    if (!found) return { error: "No size with that variant id." };
    return {
      bread: found.product.name,
      size: found.variant.label,
      stock: found.variant.stock,
    };
  }

  return { error: `Unknown tool: ${name}` };
}
