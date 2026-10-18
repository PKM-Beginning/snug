import { ImageResponse } from "next/og";

// Generated at build time — an original branded card, no third-party assets.
export const alt = "Snug — Stay Warm. Spend Less.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #D7E2FA 0%, #E9E4FB 55%, #F6F8FE 100%)",
          color: "#0B1B3F",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "32px",
              background: "linear-gradient(135deg, #8FD3FF, #3F86E8 50%, #6A5BEF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inline SVG snowflake (no emoji font or network fetch needed) */}
            <svg width="76" height="76" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
              <path d="M32 6v52M9.5 19l45 26M9.5 45l45-26" />
              <path d="M25 10l7 6 7-6M25 54l7-6 7 6M11 28l9-1.5 2.5-8.5M53 36l-9 1.5-2.5 8.5M11 36l9 1.5 2.5 8.5M53 28l-9-1.5-2.5-8.5" />
            </svg>
          </div>
          <div style={{ fontSize: "112px", fontWeight: 700, letterSpacing: "-3px" }}>Snug</div>
        </div>
        <div style={{ marginTop: "36px", fontSize: "60px", fontWeight: 700, color: "#3F6FF0" }}>Stay Warm. Spend Less.</div>
        <div style={{ marginTop: "20px", fontSize: "32px", color: "#1D3A76" }}>Winter fashion, compared across stores.</div>
      </div>
    ),
    size
  );
}
