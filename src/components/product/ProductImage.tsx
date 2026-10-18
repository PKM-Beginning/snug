import Image from "next/image";
import { cn } from "@/lib/format";

interface Props {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Fills its (relative-positioned) parent. Works for both SVG placeholders and
 * real photos; SVGs skip the image optimiser.
 */
export function ProductImage({ src, alt, sizes, priority, className }: Props) {
  const isSvg = src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isSvg}
      // Placeholder illustrations are shown whole; real photos fill the frame.
      className={cn(isSvg ? "object-contain p-[6%]" : "object-cover", className)}
    />
  );
}
