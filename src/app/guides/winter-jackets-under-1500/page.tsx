
import Link from "next/link";


export const metadata = {
  title: "How to Choose Winter Jackets Under ₹1,500 in India (2026)",
  description:
    "Learn how to choose winter jackets under ₹1,500 in India. Compare fleece, padded jackets, insulation, fit and essential features.",
  robots: {
    index: true,
    follow: true,
  },
};


const tips = [
  {
    title: "1. Choose the right jacket type",
    description:
      "Fleece jackets work well for mild winters and layering. Padded jackets can provide more insulation, while windcheaters primarily help block wind. Warmth depends on the actual construction and materials.",
  },
  {
    title: "2. Check the fabric and insulation",
    description:
      "Look for details about the outer fabric, lining and filling. Polyester is common in affordable jackets, but two polyester jackets can offer very different levels of warmth.",
  },
  {
    title: "3. Pay attention to fit",
    description:
      "A winter jacket should allow comfortable movement and enough room for a sweater underneath. Compare your measurements with the seller's size chart instead of relying only on S, M or L.",
  },
  {
    title: "4. Look for practical features",
    description:
      "Useful features include secure zippers, adjustable cuffs, pockets, a comfortable collar and a hood. Consider which features you actually need for your climate.",
  },
  {
    title: "5. Check the total price",
    description:
      "A jacket advertised below ₹1,500 may cost more after delivery charges. Also check return eligibility, size exchanges and any conditions attached to discounts.",
  },
];

const jacketTypes = [
  {
    type: "Fleece jacket",
    suitableFor: "Mild winter, indoor use and layering",
    watchFor: "Limited wind protection",
  },
  {
    type: "Lightweight padded jacket",
    suitableFor: "Cooler weather and everyday commuting",
    watchFor: "Insulation quality varies",
  },
  {
    type: "Windcheater",
    suitableFor: "Windy days and light outer layering",
    watchFor: "May provide little insulation",
  },
  {
    type: "Hooded casual jacket",
    suitableFor: "Everyday styling and casual wear",
    watchFor: "A hood does not guarantee warmth",
  },
];

export default function WinterJacketsGuide() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur-md sm:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Snug Buying Guides
        </p>

        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          How to Choose Winter Jackets Under ₹1,500 in India (2026)
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Shopping on a budget does not mean choosing a jacket based
          on price alone. Here's how to compare warmth, materials,
          comfort and value before making a purchase.
        </p>

        <div className="mt-7 rounded-2xl bg-blue-50 p-5 text-sm leading-7 text-slate-700">
          <strong>About this guide:</strong> This is an independent
          educational buying guide, not a ranked list of tested
          products. Snug has not independently tested or verified
          specific jackets for this article. Prices and availability
          can change.
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Which type of winter jacket should you buy?
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {jacketTypes.map((jacket) => (
              <article
                key={jacket.type}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {jacket.type}
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  <strong>Good for:</strong> {jacket.suitableFor}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <strong>Keep in mind:</strong> {jacket.watchFor}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            5 things to check before buying
          </h2>

          <div className="mt-6 space-y-4">
            {tips.map((tip) => (
              <article
                key={tip.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {tip.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  {tip.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Explore winter fashion on Snug
          </h2>

          <p className="mt-3 text-slate-600">
            Browse our preview catalogue to explore winter clothing
            categories. Current product prices, ratings and discounts
            are illustrative demo data, not live marketplace offers.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Winter Clothing →
          </Link>
        </section>

        <p className="mt-10 text-sm leading-6 text-slate-500">
          Editorial note: Jacket suitability depends on local weather,
          activity, layering and individual comfort. Always verify
          product specifications and current prices with the seller.
        </p>
      </div>
    </main>
  );
}
