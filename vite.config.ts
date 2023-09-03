import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const base = process.env.NODE_ENV === "production" ? "/headless-heatmap/" : "/";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
});
