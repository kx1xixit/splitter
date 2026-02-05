import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // 1. Load recommended defaults first so we can override them later
  pluginJs.configs.recommended,

  // 2. Global ignores
  {
    ignores: ["node_modules/", "dist/"],
  },

  // 3. Configuration for your JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      // enable browser global variables (window, document, etc.)
      globals: {
        ...globals.browser,
        // Tell ESLint that 'lucide' exists globally
        lucide: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Disable "unused vars" because functions called from HTML
      // (like onclick="switchTab()") appear unused to the linter.
      "no-unused-vars": "off",

      "no-console": "off",
    },
  },
];
