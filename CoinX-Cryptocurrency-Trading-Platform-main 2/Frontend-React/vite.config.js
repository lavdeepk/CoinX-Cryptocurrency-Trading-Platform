import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("react") ||
            id.includes("scheduler") ||
            id.includes("redux") ||
            id.includes("react-router")
          ) {
            return "vendor-react";
          }

          if (
            id.includes("@radix-ui") ||
            id.includes("class-variance-authority") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("lucide-react")
          ) {
            return "vendor-ui";
          }

          if (id.includes("apexcharts") || id.includes("react-apexcharts") || id.includes("recharts")) {
            return "vendor-charts";
          }

          if (id.includes("axios")) {
            return "vendor-network";
          }

          return "vendor";
        },
      },
    },
  },
})
 
