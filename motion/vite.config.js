import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __GOOGLE_MAPS_API_KEY__: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY || ""),
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "motion-assets/[name][extname]",
        entryFileNames: "motion-assets/[name].js",
        chunkFileNames: "motion-assets/[name].js",
      },
    },
  },
});
