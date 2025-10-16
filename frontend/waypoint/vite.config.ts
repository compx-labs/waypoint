import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    dedupe: ['@aptos-labs/ts-sdk'],
  },
  build: {
    commonjsOptions: {
      include: [/aptos/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['aptos', '@aptos-labs/ts-sdk'],
  },
});
