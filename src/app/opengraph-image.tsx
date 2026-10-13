import { ImageResponse } from "next/og";

export const alt = "E-commerce Helix: grow your e-commerce business a little every day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // Wordmark in Kalam Bold, the same handwriting as the site. Falls back to the default font if Google Fonts is unreachable.
  const kalam = await loadKalam();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F2F1EC", color: "#1A1718" }}>
        <div style={{ display: "flex", fontSize: 44, color: "#1A1718", fontWeight: 700, fontFamily: kalam ? "Kalam" : undefined }}>E-commerce&nbsp;<span style={{ color: "#5A50D6" }}>Helix</span></div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.1, color: "#5A50D6" }}>Grow your e-commerce business a little every day</div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#3A3634" }}>Daily profit dashboard · One clear task a day · You approve every change</div>
      </div>
    ),
    { ...size, fonts: kalam ? [{ name: "Kalam", data: kalam, weight: 700, style: "normal" }] : undefined },
  );
}

async function loadKalam(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Kalam:wght@700&text=E-commerce%20Helix", { signal: AbortSignal.timeout(4000) })).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url, { signal: AbortSignal.timeout(4000) })).arrayBuffer() : null;
  } catch {
    return null;
  }
}
