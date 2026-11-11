import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Optional local companion host; production links remain on the same origin.
  const env = loadEnv(mode, process.cwd(), "GNARLY_");
  const proxy = env.GNARLY_PREVIEW_ORIGIN
    ? {
        "/demo/": {
          target: env.GNARLY_PREVIEW_ORIGIN,
          changeOrigin: true,
          secure: true,
        },
      }
    : undefined;

  // Canonical and Open Graph URLs must be absolute. Override for another host.
  const site = new URL(
    env.GNARLY_SITE_URL || "https://gnarlynav.com/",
  ).href.replace(/\/?$/, "/");

  return {
    plugins: [
      react(),
      {
        name: "gnarly-site-url",
        transformIndexHtml: {
          order: "pre",
          handler: (html) => html.replaceAll("%SITE_URL%", site),
        },
      },
    ],
    base: "/",
    server: { port: 5174, strictPort: true, proxy },
    preview: { port: 4174, strictPort: true, proxy },
  };
});
