import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  fromPrice: number;
  images: string[];
  /** Optional banner photo (public/images/banners/). Replaces the product pile. */
  photo?: string;
}

/** Wide frosted banner with a stacked product pile and a "from ₹X" seal. */
export function DealBanner({ eyebrow, title, subtitle, cta, href, fromPrice, images, photo }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white bg-gradient-to-r from-lavender-100 via-ice-100 to-ice-50 shadow-glass">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <path d="M380 300 L560 120 L640 190 L760 70 L900 210 L980 150 L1200 290 L1200 300Z" fill="#FFFFFF" opacity="0.6" />
        <path d="M760 70 L800 108 L782 106 L768 122 L748 100 L730 106Z M560 120 L590 150 L574 148 L562 160 L546 144 L534 148Z" fill="#FFFFFF" />
        <path d="M0 300 Q400 240 800 280 T1200 260 L1200 300Z" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {photo && (
        <div
          className="absolute inset-y-0 right-0 hidden w-1/2 md:block"
          style={{ maskImage: "linear-gradient(to right, transparent, #000 45%)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 45%)" }}
          aria-hidden
        >
          <Image src={photo} alt="" fill sizes="50vw" className="object-cover" />
        </div>
      )}
      <div className="relative grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:p-10">
        <div>
          <p className="chip bg-white/80 text-[11px] uppercase tracking-wider text-lavender-600">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-[40px] md:leading-tight">{title}</h2>
          <p className="mt-1.5 text-navy-900/65">{subtitle}</p>
          <Link href={href} className="btn-primary mt-5 px-6">
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="relative hidden h-44 w-[380px] md:block" aria-hidden>
          {!photo && images.slice(0, 3).map((src, i) => (
            <div
              key={src}
              className="absolute bottom-0 h-36 w-32 drop-shadow-lg"
              style={{ left: `${i * 26}%`, transform: `rotate(${[-8, 2, 9][i]}deg)`, zIndex: i === 1 ? 2 : 1 }}
            >
              <ProductImage src={src} alt="" sizes="128px" className="object-contain" />
            </div>
          ))}
          <div className="absolute -right-2 -top-2 z-10 grid h-24 w-24 place-items-center rounded-full border border-white bg-white/90 text-center shadow-lift">
            <span>
              <span className="block text-[11px] font-medium text-navy-900/60">From</span>
              <span className="block font-display text-xl font-bold">{formatPrice(fromPrice)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
