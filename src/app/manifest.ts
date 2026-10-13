import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "E-commerce Helix",
    short_name: "Helix",
    description: "Grow your e-commerce business a little every day.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#E8452C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
