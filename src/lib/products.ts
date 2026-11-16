// The product catalog. For now it lives in code so the site works without a database.
// In Phase 3 this file is replaced by queries to PostgreSQL, and the helper
// functions at the bottom keep the same names so the rest of the app barely changes.

export type Flour = "white" | "whole-wheat" | "rye" | "spelt" | "mixed";
export type Tag =
  | "vegan"
  | "classic"
  | "savory"
  | "sweet"
  | "seeded"
  | "high-fiber";

export type Variant = {
  id: string;
  label: string;
  weightG: number;
  priceAgorot: number;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  flour: Flour;
  tags: Tag[];
  ingredients: string[];
  allergens: string[];
  storage: string;
  /** Crust color used by the placeholder loaf drawing. */
  tone: string;
  variants: Variant[];
};

export const FLOUR_LABELS: Record<Flour, string> = {
  white: "White flour",
  "whole-wheat": "Whole wheat",
  rye: "Rye",
  spelt: "Spelt",
  mixed: "Mixed grains",
};

export const TAG_LABELS: Record<Tag, string> = {
  vegan: "Vegan",
  classic: "Classic",
  savory: "Savory",
  sweet: "Sweet",
  seeded: "Seeded",
  "high-fiber": "High fiber",
};

export const FLOURS = Object.keys(FLOUR_LABELS) as Flour[];
export const TAGS = Object.keys(TAG_LABELS) as Tag[];

const PRODUCTS: Product[] = [
  {
    slug: "classic-country-loaf",
    name: "Classic Country Loaf",
    tagline: "Crackly crust, open crumb, gentle tang",
    description:
      "Our everyday sourdough. A long cold fermentation gives it a golden crackly crust, a soft open crumb and a mild tang. Great for toast, sandwiches and soup.",
    flour: "white",
    tags: ["classic", "vegan"],
    ingredients: ["Wheat flour", "Water", "Sourdough starter (wheat)", "Sea salt"],
    allergens: ["Gluten (wheat)"],
    storage:
      "Keep cut side down on a board or in a paper bag for 2 to 3 days. Slice and freeze for longer storage.",
    tone: "#d9a066",
    variants: [
      { id: "classic-500", label: "Small, 500 g", weightG: 500, priceAgorot: 2800, stock: 8 },
      { id: "classic-800", label: "Large, 800 g", weightG: 800, priceAgorot: 3800, stock: 6 },
    ],
  },
  {
    slug: "whole-wheat",
    name: "100% Whole Wheat",
    tagline: "Nutty, hearty and full of grain flavor",
    description:
      "Made only with stone-milled whole wheat flour. Dense but tender, with a deep nutty flavor that is wonderful with butter, hummus or a ripe tomato.",
    flour: "whole-wheat",
    tags: ["high-fiber", "vegan"],
    ingredients: ["Whole wheat flour", "Water", "Sourdough starter (wheat)", "Sea salt"],
    allergens: ["Gluten (wheat)"],
    storage: "Keeps well for 3 to 4 days in a paper bag. Freezes beautifully sliced.",
    tone: "#a8683a",
    variants: [
      { id: "wholewheat-800", label: "Large, 800 g", weightG: 800, priceAgorot: 4000, stock: 5 },
    ],
  },
  {
    slug: "dark-rye",
    name: "Dark Rye",
    tagline: "Deep, tangy and wonderfully chewy",
    description:
      "A dense, moist loaf with a pronounced sourdough tang. Slice it thin and pair it with smoked fish, pickles, cheese or a hearty soup.",
    flour: "rye",
    tags: ["high-fiber", "vegan"],
    ingredients: ["Rye flour", "Wheat flour", "Water", "Sourdough starter (rye)", "Sea salt"],
    allergens: ["Gluten (rye, wheat)"],
    storage: "Rye improves after a day of resting. Keeps for up to 5 days wrapped in cloth.",
    tone: "#6b4226",
    variants: [
      { id: "rye-700", label: "Loaf, 700 g", weightG: 700, priceAgorot: 3800, stock: 4 },
    ],
  },
  {
    slug: "olive-rosemary",
    name: "Olive and Rosemary",
    tagline: "Savory loaf studded with Kalamata olives",
    description:
      "Our country dough folded with Kalamata olives and fresh rosemary. Fragrant and savory. Excellent with soft cheese, or just with olive oil for dipping.",
    flour: "white",
    tags: ["savory", "vegan"],
    ingredients: [
      "Wheat flour",
      "Water",
      "Sourdough starter (wheat)",
      "Kalamata olives",
      "Rosemary",
      "Olive oil",
      "Sea salt",
    ],
    allergens: ["Gluten (wheat)"],
    storage: "Best within 3 days. Warm slices in the oven to bring back the aroma.",
    tone: "#c98f4f",
    variants: [
      { id: "olive-600", label: "Loaf, 600 g", weightG: 600, priceAgorot: 4200, stock: 6 },
    ],
  },
  {
    slug: "seeded-multigrain",
    name: "Seeded Multigrain",
    tagline: "Crunchy with sunflower, pumpkin, flax and sesame",
    description:
      "A mix of white and whole wheat flours packed with toasted seeds. Satisfying crunch in every bite, and a favorite for breakfast toast and sandwiches.",
    flour: "mixed",
    tags: ["seeded", "high-fiber", "vegan"],
    ingredients: [
      "Wheat flour",
      "Whole wheat flour",
      "Sunflower seeds",
      "Pumpkin seeds",
      "Flax seeds",
      "Sesame seeds",
      "Water",
      "Sourdough starter (wheat)",
      "Sea salt",
    ],
    allergens: ["Gluten (wheat)", "Sesame"],
    storage: "Keeps for 3 to 4 days. Toasting brings out the seeds flavor.",
    tone: "#b97b43",
    variants: [
      { id: "seeded-800", label: "Large, 800 g", weightG: 800, priceAgorot: 4400, stock: 7 },
    ],
  },
  {
    slug: "cranberry-walnut",
    name: "Cranberry and Walnut",
    tagline: "Lightly sweet with tart fruit and toasted nuts",
    description:
      "Tart dried cranberries and toasted walnuts in a tender whole wheat blend. Delicious with cream cheese or a mild cheese board.",
    flour: "mixed",
    tags: ["sweet", "vegan"],
    ingredients: [
      "Wheat flour",
      "Whole wheat flour",
      "Walnuts",
      "Dried cranberries",
      "Water",
      "Sourdough starter (wheat)",
      "Sea salt",
    ],
    allergens: ["Gluten (wheat)", "Tree nuts (walnuts)"],
    storage: "Best within 3 days. Makes outstanding toast on day 3.",
    tone: "#a35f3c",
    variants: [
      { id: "cranberry-700", label: "Loaf, 700 g", weightG: 700, priceAgorot: 4600, stock: 0 },
    ],
  },
  {
    slug: "spelt",
    name: "Spelt Sourdough",
    tagline: "Mild, slightly sweet and nutty",
    description:
      "Baked with spelt flour for a softer crumb and a mild nutty sweetness. A good choice if you prefer a gentler flavor than whole wheat.",
    flour: "spelt",
    tags: ["classic", "vegan"],
    ingredients: ["Spelt flour", "Water", "Sourdough starter (spelt)", "Sea salt"],
    allergens: ["Gluten (spelt, a wheat species)"],
    storage: "Keeps for 3 days in a paper bag. Spelt dough is delicate, so handle gently.",
    tone: "#cf9a5c",
    variants: [
      { id: "spelt-700", label: "Loaf, 700 g", weightG: 700, priceAgorot: 4400, stock: 5 },
    ],
  },
  {
    slug: "zaatar-cheese",
    name: "Zaatar and Cheese",
    tagline: "Savory loaf with zaatar and melted yellow cheese",
    description:
      "A local-inspired loaf swirled with zaatar and baked with yellow cheese for a golden, savory crust. A great companion for eggs, salads and labneh.",
    flour: "white",
    tags: ["savory"],
    ingredients: [
      "Wheat flour",
      "Water",
      "Sourdough starter (wheat)",
      "Yellow cheese",
      "Zaatar (thyme, sesame, sumac)",
      "Olive oil",
      "Sea salt",
    ],
    allergens: ["Gluten (wheat)", "Milk", "Sesame"],
    storage: "Best the day it is baked. Keep refrigerated after day 2 because of the cheese.",
    tone: "#c4874a",
    variants: [
      { id: "zaatar-650", label: "Loaf, 650 g", weightG: 650, priceAgorot: 4800, stock: 3 },
    ],
  },
];

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getVariant(
  variantId: string,
): { product: Product; variant: Variant } | undefined {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function fromPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.priceAgorot));
}

export function isSoldOut(product: Product): boolean {
  return product.variants.every((v) => v.stock <= 0);
}
