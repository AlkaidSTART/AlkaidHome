import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/AlkaidHome/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/components/hooks"),
      "@planets": path.resolve(__dirname, "./src/components/planets"),
      "@shaders": path.resolve(__dirname, "./src/shaders"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@store": path.resolve(__dirname, "./src/store/index.ts"),
      "@i18n": path.resolve(__dirname, "./src/i18n/index.ts"),
    },
  },
});
