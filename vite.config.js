import { defineConfig } from "vite";

// Build for GitHub Pages project site: https://manoharreddy.me/TCS/
// Use gh-pages branch deployment (dist/) via npm run deploy.
export default defineConfig({
  base: "/TCS/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
