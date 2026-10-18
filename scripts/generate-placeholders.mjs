// Generates original, flat SVG garment illustrations (transparent background) used as dev placeholders.
// Run: npm run placeholders   (output: public/images/placeholders/)
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public/images/placeholders");
mkdirSync(out, { recursive: true });

const tones = {
  navy: { fill: "#2C4E92", shade: "#1D3A76", bg: ["#EEF4FC", "#D9E6F7"] },
  ice: { fill: "#A9C9EE", shade: "#6FA8DC", bg: ["#F5F9FE", "#E3EEFA"] },
  lavender: { fill: "#B9A8EE", shade: "#8E78DB", bg: ["#F7F5FE", "#E9E3FB"] },
  sand: { fill: "#D9BC94", shade: "#B8956A", bg: ["#FBF7F1", "#F1E7D9"] },
  charcoal: { fill: "#4A5163", shade: "#323848", bg: ["#F3F5F8", "#E2E6ED"] },
  rust: { fill: "#E07B4F", shade: "#B85A33", bg: ["#FFF6F1", "#FBE3D6"] },
};

const shapes = {
  jackets: (t) => `
    <path d="M150 120 L200 108 L250 120 L318 158 L342 330 L304 338 L288 222 L288 402 L112 402 L112 222 L96 338 L58 330 L82 158 Z" fill="${t.fill}"/>
    <path d="M150 120 L200 150 L250 120 L240 104 L200 118 L160 104 Z" fill="${t.shade}"/>
    ${[178, 228, 278, 328, 372].map((y) => `<path d="M112 ${y} Q200 ${y + 10} 288 ${y}" stroke="${t.shade}" stroke-width="3" fill="none" opacity=".55"/>`).join("")}
    <line x1="200" y1="150" x2="200" y2="402" stroke="${t.shade}" stroke-width="4"/>`,
  hoodies: (t) => `
    <path d="M150 128 L250 128 L318 162 L340 330 L302 338 L288 230 L288 402 L112 402 L112 230 L98 338 L60 330 L82 162 Z" fill="${t.fill}"/>
    <path d="M150 132 Q150 70 200 66 Q250 70 250 132 Q225 160 200 160 Q175 160 150 132 Z" fill="${t.shade}"/>
    <path d="M168 132 Q170 92 200 90 Q230 92 232 132 Q216 146 200 146 Q184 146 168 132 Z" fill="${t.fill}" opacity=".6"/>
    <rect x="148" y="300" width="104" height="52" rx="10" fill="${t.shade}" opacity=".5"/>
    <line x1="188" y1="160" x2="186" y2="214" stroke="#fff" stroke-width="3" opacity=".8"/>
    <line x1="212" y1="160" x2="214" y2="214" stroke="#fff" stroke-width="3" opacity=".8"/>`,
  sweaters: (t) => `
    <path d="M155 120 L245 120 L318 158 L340 330 L302 338 L288 226 L288 402 L112 402 L112 226 L98 338 L60 330 L82 158 Z" fill="${t.fill}"/>
    <path d="M160 120 Q200 156 240 120" stroke="${t.shade}" stroke-width="10" fill="none"/>
    ${[200, 250, 300].map((y) => `<path d="M118 ${y} ${Array.from({ length: 11 }, (_, i) => `L${126 + i * 16} ${y + (i % 2 ? 10 : 0)}`).join(" ")}" stroke="${t.shade}" stroke-width="3" fill="none" opacity=".6"/>`).join("")}
    <rect x="112" y="382" width="176" height="20" fill="${t.shade}" opacity=".7"/>`,
  sweatshirts: (t) => `
    <path d="M155 120 L245 120 L318 158 L340 330 L302 338 L288 226 L288 402 L112 402 L112 226 L98 338 L60 330 L82 158 Z" fill="${t.fill}"/>
    <path d="M160 120 Q200 150 240 120" stroke="${t.shade}" stroke-width="8" fill="none"/>
    <circle cx="200" cy="230" r="26" fill="none" stroke="#fff" stroke-width="5" opacity=".85"/>
    <path d="M200 214 L200 246 M186 222 L214 238 M214 222 L186 238" stroke="#fff" stroke-width="3" opacity=".85"/>
    <rect x="112" y="384" width="176" height="18" fill="${t.shade}" opacity=".6"/>`,
  accessories: (t) => `
    <path d="M120 250 Q120 120 200 116 Q280 120 280 250 Z" fill="${t.fill}"/>
    <rect x="110" y="236" width="180" height="44" rx="12" fill="${t.shade}"/>
    ${[140, 170, 200, 230, 260].map((x) => `<line x1="${x}" y1="140" x2="${x}" y2="236" stroke="${t.shade}" stroke-width="3" opacity=".45"/>`).join("")}
    <circle cx="200" cy="104" r="26" fill="${t.shade}"/>
    <path d="M130 318 L270 318 L262 360 L236 360 L236 410 L208 410 L208 360 L138 360 Z" fill="${t.fill}" opacity=".85"/>
    ${[218, 228].map((x) => `<line x1="${x}" y1="410" x2="${x}" y2="426" stroke="${t.shade}" stroke-width="3"/>`).join("")}`,
  footwear: (t) => `
    <path d="M140 130 L230 130 L234 280 Q300 290 330 320 Q342 340 330 360 L100 360 Q92 300 120 280 Z" fill="${t.fill}"/>
    <rect x="96" y="356" width="242" height="26" rx="8" fill="${t.shade}"/>
    <path d="M140 130 L230 130 L230 156 L140 156 Z" fill="${t.shade}" opacity=".6"/>
    ${[190, 220, 250].map((y) => `<line x1="196" y1="${y}" x2="228" y2="${y + 4}" stroke="#fff" stroke-width="4" opacity=".8"/>`).join("")}`,
};

let count = 0;
for (const [cat, draw] of Object.entries(shapes)) {
  for (const [name, t] of Object.entries(tones)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img" aria-label="${cat} placeholder">
  <ellipse cx="200" cy="440" rx="130" ry="14" fill="#0B1B3F" opacity=".06"/>
  <g>${draw(t)}</g>
</svg>`;
    writeFileSync(join(out, `${cat}-${name}.svg`), svg);
    count++;
  }
}
console.log(`Wrote ${count} placeholders to ${out}`);
