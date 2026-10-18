import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "jackets",
    name: "Jackets",
    shortName: "Jackets",
    description: "Puffers, bombers and parkas built for real cold.",
    image: "/images/placeholders/jackets-navy.svg",
    tint: "from-ice-100 to-ice-200",
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    shortName: "Hoodies",
    description: "Fleece-lined everyday layers.",
    image: "/images/placeholders/hoodies-lavender.svg",
    tint: "from-lavender-100 to-lavender-200",
  },
  {
    slug: "sweaters",
    name: "Sweaters",
    shortName: "Sweaters",
    description: "Knits, cardigans and turtlenecks.",
    image: "/images/placeholders/sweaters-sand.svg",
    tint: "from-ember-50 to-ember-100",
  },
  {
    slug: "sweatshirts",
    name: "Sweatshirts",
    shortName: "Sweatshirts",
    description: "Crewnecks and pullovers for easy layering.",
    image: "/images/placeholders/sweatshirts-ice.svg",
    tint: "from-ice-50 to-ice-100",
  },
  {
    slug: "accessories",
    name: "Winter Accessories",
    shortName: "Accessories",
    description: "Beanies, scarves, gloves and thermals.",
    image: "/images/placeholders/accessories-rust.svg",
    tint: "from-lavender-50 to-ice-100",
  },
  {
    slug: "footwear",
    name: "Winter Footwear",
    shortName: "Footwear",
    description: "Boots and warm-lined sneakers.",
    image: "/images/placeholders/footwear-charcoal.svg",
    tint: "from-ice-100 to-lavender-100",
  },
];

export const budgetTiers = [
  { max: 499, label: "Under ₹499", note: "Beanies, gloves & socks" },
  { max: 999, label: "Under ₹999", note: "Hoodies & sweatshirts" },
  { max: 1499, label: "Under ₹1,499", note: "Sweaters & light jackets" },
  { max: 2499, label: "Under ₹2,499", note: "Puffers & boots" },
] as const;
