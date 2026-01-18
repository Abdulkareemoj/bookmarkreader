import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      jsxImportSource: "react",
      babel: {
        plugins: ["@babel/plugin-transform-flow-strip-types"],
      },
    }),
  ],
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    extensions: [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
    ],
  },
  optimizeDeps: {
    exclude: [
      "expo",
      "expo-modules-core",
      "expo-sqlite",
      "react-native",
      "react-native-web",
      "@expo/vector-icons",
    ],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});

export default config;
