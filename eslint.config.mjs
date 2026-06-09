import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated / not linted.
    ".open-next/**",
    "db/source/**",
  ]),
  {
    rules: {
      // Reading localStorage and resetting derived state inside an effect are
      // legitimate here (SSR-safe persistence + reset-on-input). Keep as a hint.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
