import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { devApi } from "./server/devApi";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Pilot previews never ship to production: no route, no pilot photos.
  const production = (process.env.VERCEL_ENV ?? env.VERCEL_ENV) === "production";
  return {
    define: {
      __PILOT_ROUTE__: JSON.stringify(!production),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      // Solana libraries expect Buffer in the browser.
      nodePolyfills({ include: ["buffer"], globals: { Buffer: true, global: false, process: false } }),
      devApi(env),
      {
        name: "menaroyal-strip-pilots",
        apply: "build",
        closeBundle() {
          if (production) fs.rmSync(path.resolve(__dirname, "dist/pilots"), { recursive: true, force: true });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    publicDir: "public",
  };
});
