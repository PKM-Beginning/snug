import { ArrowRight, Scale, Search, ShoppingCart } from "lucide-react";
import { Fragment } from "react";

const STEPS = [
  { icon: Search, title: "Discover", text: "Find winter products in one place." },
  { icon: Scale, title: "Compare", text: "Compare currently available offers." },
  { icon: ShoppingCart, title: "Buy", text: "Purchase directly from the original marketplace." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="section">
      <h2 id="how-heading" className="font-display text-xl font-bold tracking-tight md:text-[26px]">
        How it works
      </h2>
      <p className="mt-1 text-sm text-navy-900/60">The best winter deals in three simple steps.</p>
      <ol className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <Fragment key={title}>
            <li className="flex flex-1 items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white bg-gradient-to-br from-lavender-100 to-ice-100 text-lavender-600 shadow-glass">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.14em]">
                  <span className="text-lavender-500">{i + 1}.</span> {title}
                </h3>
                <p className="mt-0.5 text-sm text-navy-900/60">{text}</p>
              </div>
            </li>
            {i < STEPS.length - 1 && <ArrowRight className="hidden h-5 w-5 shrink-0 text-navy-900/25 md:block" aria-hidden />}
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
