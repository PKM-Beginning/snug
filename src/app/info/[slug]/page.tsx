import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Info & legal pages — INTERIM versions for the public preview.
 *
 * BEFORE LAUNCHING AS A SHOPPING SERVICE, replace with reviewed text that includes:
 *   - Contact: a real support email / postal address (and a grievance contact if required).
 *   - Privacy: data controller identity, contact, analytics/cookies actually used, affiliate
 *     click tracking, retention, user rights — reviewed against India's DPDP Act 2023.
 *   - Terms: operator's legal name, governing law and jurisdiction, liability terms.
 *   - Affiliate disclosure: the exact wording each approved programme requires.
 */

const LAST_UPDATED = "18 October 2026";

interface Section {
  heading?: string;
  paragraphs: string[];
}

interface InfoPageContent {
  title: string;
  description: string;
  interim?: boolean;
  sections: Section[];
}

const PAGES: Record<string, InfoPageContent> = {
  about: {
    title: "About Snug",
    description: "Stay Warm. Spend Less. — a winter-fashion price comparison site, currently in preview.",
    sections: [
      {
        paragraphs: [
          "Snug is being built to help you find affordable winter fashion by comparing offers from several online marketplaces in one place. Snug won't sell anything itself: when you choose a product, you'll buy it from the original store — at their price, with their checkout, delivery and returns.",
        ],
      },
      {
        heading: "This is a preview",
        paragraphs: [
          "Snug is not yet a working shopping service. Every product, brand, price, discount, rating and store offer you see is demonstration data created to design and test the site. The brands are fictional, and the store prices do not come from Amazon, Flipkart, Myntra or any other marketplace.",
          "Buy buttons are disabled, and no links on the site earn money. You can still browse, search, filter, and save items to a wishlist that stays on your own device.",
        ],
      },
      {
        heading: "What comes next",
        paragraphs: [
          "Real product data will only be added through official affiliate programmes and product feeds, once Snug has been approved for them. Snug will not scrape marketplace websites.",
        ],
      },
    ],
  },
  "how-it-works": {
    title: "How Snug works",
    description: "Discover, compare, buy — and what the preview can do today.",
    sections: [
      {
        heading: "How it's designed to work",
        paragraphs: [
          "Discover: browse winter jackets, hoodies, sweaters, accessories and footwear in one catalogue.",
          "Compare: for each product, see the offers currently available from different stores, with the lowest in-stock price highlighted.",
          "Buy: follow a link to the store and complete your purchase there. Prices can change, so the store's own page always has the final price.",
        ],
      },
      {
        heading: "In this preview",
        paragraphs: [
          "Discover and Compare work, but only with demonstration data. Buy is turned off: the buttons are labelled “Demo” and don't lead to any store.",
        ],
      },
    ],
  },
  "affiliate-disclosure": {
    title: "Affiliate disclosure",
    description: "How Snug will be funded, and where things stand today.",
    interim: true,
    sections: [
      {
        heading: "Today",
        paragraphs: [
          "Snug is not currently a member of any affiliate programme. No links on this site earn a commission, and Buy buttons are disabled. Marketplace names appear only to show how comparisons will work; Snug is not affiliated with, sponsored by or endorsed by those marketplaces.",
        ],
      },
      {
        heading: "In future",
        paragraphs: [
          "Snug plans to fund itself through affiliate programmes. If you buy through a Snug link, the store may pay Snug a commission. This will not change the price you pay, and Snug will continue to highlight the lowest available price whichever store offers it.",
          "Any statement an affiliate programme requires will be added to this page before its links go live.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy notice",
    description: "What the Snug preview does — and doesn't do — with your data.",
    interim: true,
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "The preview has no accounts, sign-up or contact forms, and it does not use analytics, advertising trackers or cookies of its own.",
        ],
      },
      {
        heading: "Your wishlist",
        paragraphs: [
          "Items you save are stored only in your browser's local storage on your device. They are not sent to Snug. You can remove them at any time from the wishlist, or by clearing your browser's site data.",
        ],
      },
      {
        heading: "Hosting",
        paragraphs: [
          "Like any website, the servers that deliver Snug process technical information such as your IP address and browser type to serve and secure the site. Snug is hosted on Vercel; see Vercel's privacy policy for how it handles this data.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "This notice covers the preview only. It will be replaced with a full privacy policy before Snug collects any personal data or adds affiliate links.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    description: "Terms for using the Snug preview.",
    interim: true,
    sections: [
      {
        paragraphs: [
          "Snug is currently a preview provided for demonstration and testing. By using it, you accept these interim terms.",
        ],
      },
      {
        heading: "No sales or offers",
        paragraphs: [
          "Snug does not sell products. All products, prices, discounts, ratings and store offers shown in the preview are demonstration data. They are not offers to sell and do not reflect real listings or prices.",
        ],
      },
      {
        heading: "No affiliation",
        paragraphs: [
          "Marketplace names and trademarks belong to their respective owners. Their appearance in the preview does not mean they are affiliated with, sponsor or endorse Snug.",
        ],
      },
      {
        heading: "As-is",
        paragraphs: [
          "The preview is provided as-is, without warranties of any kind, and may change or be taken offline at any time.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact",
    description: "Getting in touch with Snug.",
    sections: [
      {
        paragraphs: [
          "Snug is in preview, and contact details will be published here before the public launch.",
        ],
      },
    ],
  },
};

// Only pre-built paths exist, so unknown URLs get a real HTTP 404 (not a streamed 200).
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = PAGES[(await params).slug];
  return page ? { title: page.title, description: page.description, alternates: { canonical: `/info/${(await params).slug}` } } : { title: "Not found" };
}

export default async function InfoPage({ params }: { params: Params }) {
  const page = PAGES[(await params).slug];
  if (!page) notFound();
  return (
    <>
      <PageHeader title={page.title} description={page.description} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <article className="container max-w-3xl pb-14 pt-4">
        {page.interim && (
          <p className="glass mb-8 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm text-navy-900/80">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ice-500" aria-hidden />
            <span>
              <strong className="font-semibold text-navy-900">Interim notice for the preview.</strong> Last updated {LAST_UPDATED}. It
              will be replaced with a reviewed version before Snug launches as a shopping service.
            </span>
          </p>
        )}
        <div className="space-y-8">
          {page.sections.map((section, i) => (
            <section key={section.heading ?? i}>
              {section.heading && <h2 className="font-display text-xl font-bold tracking-tight">{section.heading}</h2>}
              <div className={`space-y-3 leading-relaxed text-navy-900/80 ${section.heading ? "mt-2" : ""}`}>
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
