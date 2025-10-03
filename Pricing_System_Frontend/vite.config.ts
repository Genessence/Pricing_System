import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Log the current mode and command for debugging
  console.log(`🚀 Vite running in ${mode} mode (command: ${command})`);

  // Get NODE_ENV from environment
  const nodeEnv = process.env.NODE_ENV;
  console.log(`📦 NODE_ENV: ${nodeEnv}`);

  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],

    // Define global constants
    define: {
      __APP_MODE__: JSON.stringify(mode),
      __APP_COMMAND__: JSON.stringify(command),
      __NODE_ENV__: JSON.stringify(nodeEnv),
    },

    // Environment-specific configurations
    build: {
      // Source maps based on mode
      sourcemap:
        mode === "development" || mode === "staging" || mode === "testing",

      // Minification based on mode
      minify: mode === "production" || mode === "staging",

      // Output directory based on mode
      outDir: `dist/${mode}`,

      // Rollup options
      rollupOptions: {
        output: {
          // Add mode to chunk file names
          chunkFileNames: `assets/[name]-${mode}-[hash].js`,
          entryFileNames: `assets/[name]-${mode}-[hash].js`,
          assetFileNames: `assets/[name]-${mode}-[hash].[ext]`,
        },
      },
    },

    // Development server configuration
    server: {
      port: 5173,
      open: true,
      // Different ports for different modes
      ...(mode === "staging" && { port: 5174 }),
      ...(mode === "testing" && { port: 5175 }),
    },

    // Preview server configuration
    preview: {
      port: 4173,
      // Different ports for different modes
      ...(mode === "staging" && { port: 4174 }),
      ...(mode === "testing" && { port: 4175 }),
    },

    // Environment variables
    envPrefix: ["VITE_", "APP_"],
  };
});
