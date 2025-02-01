import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0', 
      port: 5000, 
      strictPort: true, 
      allowedHosts: [
        'moroccan-transport-lhbibbaiga.replit.app',
        'moroccan-transport-lhbibbaiga.username.repl.co' 
,        '7242f997-9443-4e12-8d0b-b9a3df65337c-00-2hzv8wqtjyqji.janeway.replit.dev'
      ]
  },
});
