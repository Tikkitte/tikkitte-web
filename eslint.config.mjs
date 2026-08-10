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
    // Static design handoff exports are reference artifacts, not app source.
    "design/**",
    "codex-briefs/**",
    // Vendored, pre-built package output is linted in its source repository.
    "vendor/tikkitte-ui/dist/**",
  ]),
]);

export default eslintConfig;
