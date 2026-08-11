import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  server: { host: "0.0.0.0", port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/recharts/") ||
            id.includes("/victory-vendor/") ||
            id.includes("/d3-")
          ) {
            return "charts";
          }

          if (id.includes("/cobe/") || id.includes("/phenomenon/")) {
            return "globe";
          }

          if (id.includes("/lucide-react/")) {
            return "icons";
          }
        },
      },
    },
  },
});
