import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __GOOGLE_MAPS_API_KEY__: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY || ""),
    __BUILD_SHA__: JSON.stringify((process.env.BUILD_SHA || process.env.GITHUB_SHA || "").slice(0, 8)),
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "talks-assets/[name][extname]",
        entryFileNames: "talks-assets/[name].js",
        chunkFileNames: "talks-assets/[name].js",
      },
    },
  },
});
