import { BadgeIndianRupee, ExternalLink, HandHeart, Store } from "lucide-react";
import { IS_PREVIEW } from "@/lib/site";

// In preview, describe how Snug is designed to work — not relationships that don't exist yet.
const ITEMS = [
  { icon: Store, title: "Multiple marketplaces", text: IS_PREVIEW ? "Planned: Amazon · Flipkart · Myntra" : "Amazon · Flipkart · Myntra" },
  { icon: BadgeIndianRupee, title: "Price comparison", text: "Lowest available price highlighted" },
  { icon: ExternalLink, title: "Direct marketplace purchase", text: "Checkout & returns by the store" },
  { icon: HandHeart, title: "Affiliate-supported", text: IS_PREVIEW ? "Planned — free for you to use" : "Free for you — stores may pay us" },
];

export function TrustSection() {
  return (
    <section aria-label="Why Snug" className="container py-6 md:py-8">
      <ul className="glass grid grid-cols-1 gap-y-1 rounded-2xl p-2 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-navy-900/5">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ice-100 text-ice-500">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs text-navy-900/65">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
