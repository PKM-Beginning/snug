/**
 * Original illustrated winter landscape (mountains, pines, snowfall) used as
 * the page backdrop behind the header and hero. Pure SVG — no external assets.
 */
export function WinterBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D7E2FA" />
            <stop offset="0.45" stopColor="#E9E4FB" />
            <stop offset="1" stopColor="#F6F8FE" />
          </linearGradient>
          <linearGradient id="wb-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B9C6EE" />
            <stop offset="1" stopColor="#DCE3F8" />
          </linearGradient>
          <linearGradient id="wb-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9DB0E3" />
            <stop offset="1" stopColor="#D5DDF5" />
          </linearGradient>
          <linearGradient id="wb-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#F6F8FE" stopOpacity="0" />
            <stop offset="1" stopColor="#F6F8FE" />
          </linearGradient>
          <radialGradient id="wb-sun" cx="0.72" cy="0.18" r="0.35">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1440" height="760" fill="url(#wb-sky)" />
        <rect width="1440" height="760" fill="url(#wb-sun)" />

        {/* Far range */}
        <path d="M0 420 L120 330 L210 380 L330 250 L430 340 L540 270 L640 350 L760 210 L880 320 L990 240 L1100 330 L1220 230 L1330 320 L1440 270 L1440 760 L0 760Z" fill="url(#wb-far)" />
        <path d="M330 250 L370 286 L352 284 L340 300 L318 278 L300 284Z M760 210 L806 254 L786 250 L770 270 L748 246 L728 254Z M1220 230 L1262 268 L1242 266 L1228 282 L1206 262 L1190 266Z M990 240 L1024 270 L1008 268 L996 280 L978 264 L966 268Z" fill="#FFFFFF" opacity="0.9" />

        {/* Mid range */}
        <path d="M0 520 L150 400 L260 470 L400 360 L520 450 L660 380 L800 470 L940 370 L1080 460 L1210 390 L1340 470 L1440 420 L1440 760 L0 760Z" fill="url(#wb-mid)" opacity="0.85" />
        <path d="M400 360 L446 398 L424 396 L410 414 L388 392 L368 398Z M940 370 L984 408 L962 404 L948 422 L926 400 L906 406Z M150 400 L186 430 L168 428 L156 442 L138 426 L122 430Z" fill="#FFFFFF" opacity="0.85" />

        {/* Snow slopes */}
        <path d="M0 600 Q360 520 720 590 T1440 560 L1440 760 L0 760Z" fill="#FFFFFF" opacity="0.92" />
        <path d="M0 660 Q420 600 860 650 T1440 630 L1440 760 L0 760Z" fill="#F4F7FE" />

        {/* Pines — left cluster */}
        <g fill="#33467A" opacity="0.9">
          <Pine x={10} y={650} s={1.3} />
          <Pine x={70} y={620} s={0.9} />
          <Pine x={120} y={660} s={1.0} />
        </g>
        {/* Pines — right cluster */}
        <g fill="#33467A" opacity="0.9">
          <Pine x={1240} y={630} s={0.9} />
          <Pine x={1300} y={650} s={1.3} />
          <Pine x={1370} y={615} s={1.1} />
          <Pine x={1420} y={655} s={1.5} />
        </g>

        {/* Snowfall */}
        <g fill="#FFFFFF">
          {SNOW.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity={0.75} />
          ))}
        </g>

        <rect width="1440" height="760" fill="url(#wb-fade)" />
      </svg>
    </div>
  );
}

function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -150 L22 -100 L12 -100 L32 -60 L18 -60 L42 -15 L-42 -15 L-18 -60 L-32 -60 L-12 -100 L-22 -100Z" />
      <path d="M0 -150 L10 -128 L-10 -128Z M-14 -100 L14 -100 L8 -92 L-8 -92Z M-26 -60 L26 -60 L18 -52 L-18 -52Z" fill="#FFFFFF" opacity="0.85" />
      <rect x="-5" y="-15" width="10" height="16" fill="#26355E" />
    </g>
  );
}

const SNOW: [number, number, number][] = [
  [60, 80, 2.5], [180, 150, 1.8], [300, 60, 2], [420, 190, 1.5], [520, 110, 2.6], [610, 40, 1.6],
  [700, 170, 2.2], [820, 90, 1.7], [930, 140, 2.4], [1040, 60, 1.8], [1150, 180, 2], [1260, 100, 2.7],
  [1360, 50, 1.6], [1410, 200, 2.1], [90, 260, 1.6], [250, 300, 2.2], [480, 280, 1.4], [880, 250, 1.9],
  [1110, 280, 1.5], [1320, 300, 2.3], [640, 300, 1.3], [990, 330, 1.7],
];
