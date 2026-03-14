import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
