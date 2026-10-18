import Link from "next/link";
import { Logo } from "./Logo";
import { categories } from "@/lib/data/categories";
import { IS_PREVIEW } from "@/lib/site";

const COMPANY = [
  { href: "/info/about", label: "About" },
  { href: "/info/how-it-works", label: "How It Works" },
  { href: "/info/contact", label: "Contact" },
];
const LEGAL = [
  { href: "/info/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/info/privacy", label: "Privacy Policy" },
  { href: "/info/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="container pb-6 pt-6">
        <div className="glass rounded-3xl">
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <Logo showTagline />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-900/60">
                Compare winter fashion offers from leading marketplaces and buy on the original store.
              </p>
            </div>
            <FooterCol title="Shop" className="md:col-span-3">
              {categories.map((c) => (
                <FooterLink key={c.slug} href={`/category/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Company" className="md:col-span-2">
              {COMPANY.map((l) => (
                <FooterLink key={l.href} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Legal" className="md:col-span-3">
              {LEGAL.map((l) => (
                <FooterLink key={l.href} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </FooterCol>
          </div>

          <div className="space-y-2.5 border-t border-navy-900/5 p-6 text-xs leading-relaxed text-navy-900/65 sm:px-8">
            {IS_PREVIEW ? (
              <>
                <p>
                  <strong className="font-semibold text-navy-900/80">Preview:</strong> Snug is not yet a working
                  shopping service. All products, brands, prices, discounts, ratings and store offers shown are
                  demonstration data and do not reflect real marketplace listings. Buy buttons are disabled.
                </p>
                <p>
                  <strong className="font-semibold text-navy-900/80">Affiliate disclosure:</strong> Snug is not currently
                  a member of any affiliate programme and earns nothing from this site. Store names are shown only to
                  illustrate how comparisons will work; Snug is not affiliated with or endorsed by them. This notice will
                  be updated before any affiliate links go live.
                </p>
              </>
            ) : (
              <p>
                <strong className="font-semibold text-navy-900/80">Affiliate disclosure:</strong> Snug participates in
                affiliate programmes. When you buy through links on this site we may earn a commission at no extra cost
                to you. Prices and availability are set by each marketplace and can change; always confirm the final
                price on the store&apos;s page.
              </p>
            )}
            <p>© {new Date().getFullYear()} Snug. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-navy-900/60">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-ice-500">
        {children}
      </Link>
    </li>
  );
}
