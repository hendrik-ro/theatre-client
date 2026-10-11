import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

// The repo keeps a single .env at the monorepo root; Vite only loads
// env files from its own root by default. Resolve from this module's
// location so the file is found regardless of the process cwd.
const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);
dotenv.config({ path: envPath });

const clientPort = Number(process.env.CLIENT_PORT) || 5173;
const serverPort = Number(process.env.SERVER_PORT) || 3000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: clientPort,
    proxy: {
      "/api": `http://localhost:${serverPort}`,
    },
  },
});
