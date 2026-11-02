import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For `npm run dev` only: forward /api to local backend.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5000" } },
});
