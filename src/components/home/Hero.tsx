import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Snowflake, Store } from "lucide-react";
import type { Merchant, Product } from "@/lib/types";
import { bestOffer } from "@/lib/filters";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { StoreMark } from "@/components/product/StoreMark";
import { IS_PREVIEW } from "@/lib/site";

const STORES: Merchant[] = ["Amazon", "Flipkart", "Myntra"];

interface Props {
  featured: Product[];
  maxDiscount: number;
  /**
   * Optional licensed lifestyle photo (see HERO_PHOTO in app/page.tsx).
   * When absent, a product showcase is shown as a temporary placeholder.
   */
  heroImage?: string;
  /** CSS object-position for the photo, used to keep faces in frame. */
  heroImagePosition?: string;
}

const PHOTO_ALT = "A man and a woman in winter jackets and knitwear on a snowy mountainside";

export function Hero({ featured, maxDiscount, heroImage, heroImagePosition = "60% 22%" }: Props) {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {heroImage && <HeroPhotoDesktop src={heroImage} position={heroImagePosition} />}
      <div className="container relative grid items-center gap-10 pb-10 pt-10 md:pt-14 lg:min-h-[560px] lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:pb-16">
        <div className="max-w-xl">
          <p className="chip glass mb-5 py-1.5 text-[11px] uppercase tracking-wider text-ice-500">
            <Snowflake className="h-3.5 w-3.5" aria-hidden />
            Winter fashion deals
          </p>
          <h1 id="hero-heading" className="font-display text-[40px] font-bold leading-[1.04] tracking-tight sm:text-[52px] lg:text-[60px]">
            Winter Deals
            <span className="block bg-gradient-to-r from-[#3F6FF0] to-lavender-500 bg-clip-text text-transparent">
              Without The Winter Price.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-navy-900/75 sm:text-lg">
            Discover jackets, hoodies, sweaters and winter essentials from leading marketplaces — all in one place.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/deals" className="btn-primary px-7">
              Explore Winter Deals
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/products?maxPrice=999" className="btn-outline px-7">
              Shop Under ₹999
            </Link>
          </div>
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-900/60">
              {IS_PREVIEW ? "Stores we plan to compare" : "Compare offers from"}
            </p>
            <ul className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-2">
              {STORES.map((m) => (
                <li key={m}>
                  <StoreMark merchant={m} size="md" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {heroImage ? (
          // Photo is painted behind this column (desktop) or below the text (mobile);
          // this column only positions the glass panel over the lower corner.
          <div className="relative hidden lg:block lg:h-[480px]">
            <InfoPanel maxDiscount={maxDiscount} />
          </div>
        ) : (
          <div className="relative">
            <HeroShowcase featured={featured} />
            <InfoPanel maxDiscount={maxDiscount} />
          </div>
        )}
      </div>
      {heroImage && <HeroPhotoMobile src={heroImage} position={heroImagePosition} />}
    </section>
  );
}

/*
 * No card, border or radius: the photo bleeds to the right edge and is
 * feathered into the snowy backdrop with intersecting gradient masks
 * (strong on the left and bottom, light at the top).
 */
const DESKTOP_MASK = [
  "linear-gradient(to right, transparent 0%, #000 34%)",
  "linear-gradient(to top, transparent 0%, #000 28%)",
  "linear-gradient(to bottom, transparent 0%, #000 10%)",
].join(", ");

const MOBILE_MASK = "linear-gradient(to bottom, transparent 0%, #000 16%, #000 72%, transparent 100%)";

function maskStyle(mask: string): React.CSSProperties {
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

function HeroPhotoDesktop({ src, position }: { src: string; position: string }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block" style={maskStyle(DESKTOP_MASK)}>
      <Image src={src} alt={PHOTO_ALT} fill priority sizes="62vw" className="object-cover" style={{ objectPosition: position }} />
    </div>
  );
}

function HeroPhotoMobile({ src, position }: { src: string; position: string }) {
  return (
    <div className="relative -mt-6 h-[340px] sm:h-[440px] lg:hidden" style={maskStyle(MOBILE_MASK)}>
      <Image src={src} alt={PHOTO_ALT} fill sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
    </div>
  );
}

/** Two tilted product cards over a frosted panel — used until licensed photography is added. */
function HeroShowcase({ featured }: { featured: Product[] }) {
  const [main, second, third] = featured;
  if (!main) return null;
  return (
    <div className="relative mx-auto h-[380px] max-w-[580px] sm:h-[440px] lg:ml-0">
      <div className="absolute inset-x-6 bottom-0 top-10 rounded-[2.5rem] bg-gradient-to-br from-white/70 to-lavender-100/60 backdrop-blur-sm" aria-hidden />
      <ShowcaseCard product={main} className="left-[4%] top-0 w-[54%] -rotate-3" large priority />
      {second && <ShowcaseCard product={second} className="right-[4%] top-[2%] w-[36%] rotate-[5deg]" />}
      {third && <ShowcaseCard product={third} className="bottom-0 left-[46%] hidden w-[28%] rotate-2 sm:block xl:hidden" />}
      <p className="absolute -bottom-7 left-0 right-0 text-center text-[10px] text-navy-900/60">Illustrative demo products</p>
    </div>
  );
}

function ShowcaseCard({ product, className, large, priority }: { product: Product; className: string; large?: boolean; priority?: boolean }) {
  const best = bestOffer(product);
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group absolute overflow-hidden rounded-3xl border border-white bg-white shadow-lift transition-transform duration-300 hover:rotate-0 ${className}`}
    >
      <div className={`relative ${large ? "aspect-[4/4.2]" : "aspect-square"} bg-gradient-to-br from-ice-100 to-lavender-100`}>
        <ProductImage src={product.image} alt={product.name} sizes="(min-width:1024px) 22vw, 50vw" priority={priority} />
        <span className="chip absolute left-3 top-3 bg-ember-500 text-white">-{product.discount}%</span>
      </div>
      <div className={large ? "p-4" : "p-3"}>
        {large && <p className="line-clamp-1 text-sm font-semibold group-hover:text-ice-500">{product.name}</p>}
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <span className={`font-bold ${large ? "text-lg" : "text-sm"}`}>{formatPrice(product.price)}</span>
          {large && <span className="text-xs text-navy-900/60 line-through">{formatPrice(product.mrp)}</span>}
        </p>
        <p className="mt-0.5 text-[11px] text-navy-900/65">Lowest at {best.merchant}</p>
      </div>
    </Link>
  );
}

function InfoPanel({ maxDiscount }: { maxDiscount: number }) {
  const items = [
    IS_PREVIEW
      ? { icon: Flame, title: "Demo deals", text: `Sample discounts up to ${maxDiscount}%`, tone: "bg-ember-50 text-ember-500" }
      : { icon: Flame, title: "Trending deals", text: `Up to ${maxDiscount}% off`, tone: "bg-ember-50 text-ember-500" },
    { icon: Store, title: "Multiple stores", text: "Compare & save", tone: "bg-lavender-100 text-lavender-600" },
    { icon: Snowflake, title: "Winter essentials", text: "Jackets, hoodies & more", tone: "bg-ice-100 text-ice-500" },
  ];
  return (
    <ul className="glass absolute bottom-6 right-0 hidden w-56 space-y-4 rounded-2xl bg-white/80 p-4 xl:block">
      {items.map(({ icon: Icon, title, text, tone }) => (
        <li key={title} className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs text-navy-900/65">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
