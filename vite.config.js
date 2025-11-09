import { defineConfig } from "vite";

// Build for GitHub Pages at https://manoharreddy.me/TCS/
export default defineConfig({
  base: "/TCS/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
