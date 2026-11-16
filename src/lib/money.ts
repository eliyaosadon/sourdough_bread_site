// Money is always stored as integers in agorot (1 shekel = 100 agorot)
// so we never suffer from floating point rounding errors.
const formatter = new Intl.NumberFormat("en-IL", {
  style: "currency",
  currency: "ILS",
});

export function formatPrice(agorot: number): string {
  return formatter.format(agorot / 100);
}
