import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fish Bubbles",
    short_name: "Fish Bubbles",
    description: "A little pond for your thoughts 🐟",
    start_url: "/",
    display: "standalone",
    background_color: "#d3edf0",
    theme_color: "#1B2A4A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}