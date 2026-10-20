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

const LAST_UPDATED = "20 October 2026";

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
  title: "Affiliate Disclosure",
  description:
    "Learn how Snug may earn commissions through affiliate partnerships.",
  interim: true,
  sections: [
    {
      heading: "Our current status",
      paragraphs: [
        "Snug is currently a winter-fashion discovery website in public preview. We are not yet participating in any affiliate programme.",
        "All products, prices, discounts, ratings, and marketplace offers currently displayed are demonstration data. They are not verified listings or live marketplace prices.",
        "Purchase buttons are disabled, and Snug does not currently earn commissions from website visitors.",
      ],
    },
    {
      heading: "How affiliate partnerships may work",
      paragraphs: [
        "In the future, Snug may participate in affiliate programmes operated by online retailers and affiliate networks.",
        "When you click an eligible affiliate link and make a qualifying purchase, Snug may receive a commission from the retailer or affiliate programme.",
        "Affiliate commissions generally do not add a separate fee to your purchase. The retailer determines the final price, availability, delivery charges, and applicable terms.",
      ],
    },
    {
      heading: "Our approach to product comparisons",
      paragraphs: [
        "Snug aims to help visitors discover and compare winter-fashion products from different retailers.",
        "When real product listings become available, we aim to present prices and offers transparently. Product availability, discounts, and prices may change, so always verify the final details on the retailer's website before purchasing.",
        "Affiliate relationships may influence which retailers and products Snug can display. We aim to clearly identify sponsored placements and affiliate links when applicable.",
      ],
    },
    {
      heading: "Retailer independence",
      paragraphs: [
        "Snug is an independent product discovery website and does not manufacture, sell, ship, or fulfill products.",
        "Marketplace names and trademarks belong to their respective owners. Their appearance does not imply sponsorship, endorsement, or partnership unless explicitly stated.",
      ],
    },
    {
      heading: "Future programme disclosures",
      paragraphs: [
        "Before activating affiliate links, Snug will update this disclosure to include the statements required by each participating affiliate programme.",
        "Affiliate relationships will also be disclosed clearly near relevant recommendations or links where appropriate.",
      ],
    },
    {
      heading: "Questions or concerns",
      paragraphs: [
        "For questions about our affiliate practices or partnerships, contact snug.support.online@gmail.com.",
      ],
    },
  ],
},

  
privacy: {
  title: "Privacy Policy",
  description: "Learn how Snug handles information during its public preview.",
  interim: true,
  sections: [
    {
      heading: "Introduction",
      paragraphs: [
        "Snug is a winter-fashion product discovery website currently operating in public preview. We respect your privacy and aim to be transparent about how information is handled when you use our website.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "Snug currently does not offer user accounts, registration, or contact forms. We do not intentionally collect personal information through these features.",
        "If you contact us by email, we receive the email address and information you choose to share so that we can respond to your inquiry.",
      ],
    },
    {
      heading: "Wishlist and browser storage",
      paragraphs: [
        "Your wishlist is stored locally in your browser using local storage. Wishlist information is not sent to Snug's servers. You can remove saved products or clear your browser's site data at any time.",
      ],
    },
    {
      heading: "Hosting and technical information",
      paragraphs: [
        "Snug is hosted on Vercel. Technical information, such as IP addresses, browser details, and request information, may be processed by our hosting provider to deliver, maintain, and secure the website.",
      ],
    },
    {
      heading: "Analytics and cookies",
      paragraphs: [
        "During the current preview, Snug does not intentionally use its own advertising trackers or analytics cookies. If analytics, advertising, or other tracking technologies are introduced, this policy will be updated to explain their use.",
      ],
    },
    {
      heading: "Affiliate links",
      paragraphs: [
        "Snug is not currently enrolled in any affiliate programme. In the future, affiliate links may redirect visitors to third-party retailers. Those retailers may process information under their own privacy policies.",
        "We will update this policy before introducing affiliate-related tracking or data collection.",
      ],
    },
    {
      heading: "Data retention and your choices",
      paragraphs: [
        "Emails sent to Snug may be retained as needed to respond to inquiries and maintain relevant correspondence. You can request deletion of your correspondence, subject to applicable legal obligations.",
        "You can manage or delete your locally stored wishlist using your browser settings.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "This policy describes Snug's current public preview. It may be updated as new features, services, or data processing activities are introduced.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        "For privacy-related questions or requests, contact us at snug.support.online@gmail.com.",
      ],
    },
  ],
},

  
  terms: {
    title: "Terms of Use",
    description:
      "Understand the terms for accessing and using Snug during its public preview.",
    interim: true,
    sections: [
      {
        heading: "About Snug",
        paragraphs: [
          "Snug is an independently operated winter-fashion discovery and price-comparison project based in India. It is currently in public preview and is not incorporated as a company.",
          "These Terms of Use explain the conditions for accessing and using the Snug website. By using the website, you agree to these terms. If you do not agree, please discontinue use.",
        ],
      },
      {
        heading: "Preview website and demonstration data",
        paragraphs: [
          "Snug is currently a demonstration website. All displayed products, brands, prices, discounts, ratings, reviews, and marketplace offers are illustrative data used to develop and test the platform.",
          "These listings are not verified commercial offers, and Snug does not currently provide purchasing functionality.",
          "Features and content may be modified, suspended, or removed as the website develops.",
        ],
      },
      {
        heading: "No direct sales or payments",
        paragraphs: [
          "Snug does not currently sell products, process payments, accept orders, arrange deliveries, or handle refunds and returns.",
          "If shopping features are introduced in the future, purchases will be completed on third-party retailers' websites, subject to their own terms and policies.",
        ],
      },
      {
        heading: "Product information and pricing",
        paragraphs: [
          "Product information shown during the preview must not be relied upon as an actual marketplace listing or current price.",
          "When verified retailer information becomes available, Snug will aim to present it accurately. However, prices, availability, shipping charges, and promotional conditions may change.",
          "Visitors should independently verify product details and final prices with the relevant retailer before purchasing.",
        ],
      },
      {
        heading: "Affiliate relationships",
        paragraphs: [
          "Snug is not currently participating in an affiliate programme and does not earn commissions through its preview product listings.",
          "Snug may introduce affiliate links in the future. Any applicable commercial relationships will be disclosed in accordance with relevant requirements.",
          "Additional information is available in Snug's Affiliate Disclosure page.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You agree to use Snug only for lawful purposes and not to interfere with the website's security, operation, or availability.",
          "You must not attempt unauthorized access to website systems, distribute malicious software through the website, or misuse its functionality.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "Original website designs, written content, branding elements, and other materials created for Snug may be protected by applicable intellectual property laws.",
          "You may access website content for personal, non-commercial use. You must not reproduce or commercially redistribute original Snug materials without permission, except where permitted by law.",
          "Third-party names, logos, trademarks, and other materials remain the property of their respective owners. Their appearance does not imply endorsement or affiliation.",
        ],
      },
      {
        heading: "External websites",
        paragraphs: [
          "Snug may provide links to third-party websites or services. Such websites are operated independently and may have different terms, privacy policies, and business practices.",
          "Snug does not control third-party websites and is not responsible for their independent content or services, subject to applicable law.",
        ],
      },
      {
        heading: "Availability and warranties",
        paragraphs: [
          "Snug is provided on an as-available basis during its public preview. We aim to maintain a useful and reliable website but cannot guarantee uninterrupted access or error-free operation.",
          "To the extent permitted by applicable law, Snug makes no additional warranties concerning the availability, completeness, or suitability of its preview content.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "To the extent permitted by applicable law, the operator of Snug will not be liable for indirect or consequential losses arising from reliance on demonstration content or temporary website unavailability.",
          "Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limits rights available under applicable consumer protection laws.",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: [
          "Information about the handling of personal data, browser storage, and communications is available in Snug's Privacy Policy.",
        ],
      },
      {
        heading: "Changes to these terms",
        paragraphs: [
          "These terms may be updated as Snug develops new features, introduces retailer integrations, or changes its operating structure.",
          "Material changes will be reflected on this page, including an updated revision date. Continued use after revised terms become effective constitutes acceptance to the extent permitted by law.",
        ],
      },
      {
        heading: "Applicable law",
        paragraphs: [
          "These terms are governed by the applicable laws of India. Any dispute-resolution arrangements remain subject to mandatory legal rights and applicable jurisdiction rules.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For questions about these terms or the Snug website, contact snug.support.online@gmail.com.",
        ],
      },
    ],
  },

  
contact: {
  title: "Contact Us",
  description: "Have a question, suggestion, or partnership inquiry? Get in touch with Snug.",
  sections: [
    {
      heading: "We'd love to hear from you",
      paragraphs: [
        "Have questions about Snug, feedback on our website, or a business collaboration idea? We're happy to hear from you.",
        "Email: snug.support.online@gmail.com",
      ],
    },
    {
      heading: "Product orders and returns",
      paragraphs: [
        "Snug is a winter-fashion product discovery platform currently in preview. We do not sell products or process payments, orders, deliveries, refunds, or returns.",
        "When shopping features become available, purchases will be completed directly on the retailer's website. For order-related issues, please contact the respective retailer.",
      ],
    },
    {
      heading: "Business and partnership inquiries",
      paragraphs: [
        "For affiliate partnerships, collaborations, or other business inquiries, contact us at snug.support.online@gmail.com.",
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
                  <p key={p}>
                    {p.split(/(snug\.support\.online@gmail\.com)/g).map((part, index) =>
                      part === "snug.support.online@gmail.com" ? (
                        <a
                          key={index}
                          href="mailto:snug.support.online@gmail.com"
                          className="font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-800"
                        >
                          {part}
                        </a>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}

              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
