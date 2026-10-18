import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Snowflake } from "lucide-react";
import { ProductImage } from "@/components/product/ProductImage";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  images: string[];
  /** Optional banner photo (public/images/banners/). Replaces the product tiles. */
  photo?: string;
}

export function PromoBanner({ eyebrow = "The layering edit", title, subtitle, cta, href, images, photo }: Props) {
  return (
    <section className="container py-6 md:py-8" aria-label={title}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-700 to-lavender-600 text-white shadow-lift">
        {photo ? (
          <div
            className="absolute inset-y-0 right-0 w-full md:w-[55%]"
            style={{ maskImage: "linear-gradient(to right, transparent, #000 40%)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 40%)" }}
            aria-hidden
          >
            <Image src={photo} alt="" fill sizes="(min-width:768px) 55vw, 100vw" className="object-cover opacity-40 md:opacity-100" />
          </div>
        ) : (
          <Snowflake className="absolute -right-10 -top-10 h-56 w-56 text-white/5" aria-hidden />
        )}
        <div className="relative grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ice-300">{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">{title}</h2>
            <p className="mt-3 text-lg text-ice-100/80">{subtitle}</p>
            <Link href={href} className="btn-primary mt-7 px-6">
              {cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {!photo && <div className="hidden grid-cols-3 gap-3 md:grid" aria-hidden>
            {images.slice(0, 3).map((src, i) => (
              <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/95 shadow-lift ${i === 1 ? "-translate-y-4" : "translate-y-4"}`}>
                <ProductImage src={src} alt="" sizes="15vw" />
              </div>
            ))}
          </div>}
        </div>
      </div>
    </section>
  );
}
