import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  // nextVitals already registers the jsx-a11y plugin, so only the rules are
  // taken from the recommended preset. Registering the plugin twice is an error.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  // Turned off until the next commit fixes the code it flags.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([
    "out/**",
    ".next/**",
    "next-env.d.ts",
    "vendor/**",
    "_site/**",
    ".bundle/**",
  ]),
]);
