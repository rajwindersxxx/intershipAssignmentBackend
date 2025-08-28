import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,        // no need to import describe/it
    environment: "node",  // for Express
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
