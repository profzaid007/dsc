import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.cjs", "pb_hooks/**/*.js", "backend/pb/pb_hooks/**/*.js"],
    // CommonJS files and PocketBase hooks use require() intentionally.
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["**/*.cjs", "pb_hooks/**/*.js", "pb_migrations/**/*.js", "backend/pb/pb_hooks/**/*.js", "backend/pb/pb_migrations/**/*.js"],
    // Backend VM modules and test loaders are not Next.js page modules.
    rules: { "@next/next/no-assign-module-variable": "off" },
  },
  {
    files: ["pb_hooks/**/*.js", "backend/pb/pb_hooks/**/*.js"],
    // These callbacks return backend data, not React components.
    rules: { "react/display-name": "off" },
  },
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    // Newly enabled compiler diagnostics are advisory while the existing application is migrated.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
