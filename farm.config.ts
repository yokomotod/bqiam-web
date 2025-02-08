import { defineConfig } from "@farmfe/core";

export default defineConfig({
  plugins: ["@farmfe/plugin-react"],
  compilation: {
    output: {
      publicPath: "./", // allow deploy on any path
    },
  },
});
