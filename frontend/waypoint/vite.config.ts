import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(), // SSR is opt-in, so this is already static by default
    tsconfigPaths(),
  ],
});
