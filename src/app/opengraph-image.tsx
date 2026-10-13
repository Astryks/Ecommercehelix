import { ImageResponse } from "next/og";

export const alt = "E-commerce Helix: grow your e-commerce business a little every day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0f172a", color: "white" }}>
        <div style={{ fontSize: 36, color: "#fb7185", fontWeight: 700 }}>E-commerce Helix</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>Grow your e-commerce business a little every day</div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#cbd5e1" }}>Daily profit dashboard · One clear task a day · You approve every change</div>
      </div>
    ),
    size,
  );
}
