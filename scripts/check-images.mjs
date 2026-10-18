// Lists which real photos are present or still missing.
// Run: npm run images:check
// Expected locations are defined in src/lib/assets.ts.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pub = join(root, "public");
const EXT = [".webp", ".jpg", ".jpeg", ".png", ".avif"];
const read = (p) => readFileSync(join(root, p), "utf8");

const productIds = [...read("src/lib/data/products.ts").matchAll(/^\s*id: "([^"]+)"/gm)].map((m) => m[1]);
const categorySlugs = [...read("src/lib/data/categories.ts").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const banners = [...read("src/lib/assets.ts").matchAll(/^\s*\w+: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);

const groups = [
  ["Hero", ["/images/hero/snug-hero"]],
  ["Banners", banners.map((b) => `/images/banners/${b}`)],
  ["Categories", categorySlugs.map((s) => `/images/categories/${s}`)],
  ["Products", productIds.map((id) => `/images/products/${id}`)],
];

let missing = 0;
for (const [title, bases] of groups) {
  const rows = bases.map((b) => {
    const found = EXT.map((e) => b + e).find((p) => existsSync(join(pub, p)));
    if (!found) missing++;
    return found ? `  ✓ ${found}` : `  ✗ public${b}.jpg`;
  });
  const have = rows.filter((r) => r.startsWith("  ✓")).length;
  console.log(`\n${title} (${have}/${bases.length} photos)`);
  rows.forEach((r) => console.log(r));
}
if (existsSync(join(pub, "images/hero/hero.jpg"))) {
  console.log("\n⚠ public/images/hero/hero.jpg exists but is unused (old screenshot) — delete it.");
}
console.log(`\n${missing} photo(s) missing. Missing items fall back to the SVG placeholders.`);
