import { readFileSync } from "node:fs";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "remove-unused-sylva-font",
      enforce: "pre",
      load(id) {
        if (!id.endsWith("inner-green-3d.html?raw")) return null;
        const source = readFileSync(id.slice(0, -4), "utf8").replace(
          /@font-face\s*\{[^}]*lexend-latin\.woff2[^}]*\}/,
          "",
        );
        return `export default ${JSON.stringify(source)};`;
      },
    },
    react(),
  ],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "seasonal-assets/[name][extname]",
        entryFileNames: "seasonal-assets/[name].js",
        chunkFileNames: "seasonal-assets/[name].js",
      },
    },
  },
});
