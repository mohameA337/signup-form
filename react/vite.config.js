import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The old public/ pages are not part of the React app, so don't copy them into dist/.
  publicDir: false,
  server: {
    // While developing, API calls go to server.js (run it with: npm start).
    proxy: { "/api": "http://localhost:3000" },
  },
});
