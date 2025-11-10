import js from "@eslint/js";
import globals from "globals";
import tslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    // eslint-disable-next-line import/no-named-as-default-member
    tslint.configs.recommended,

    // 👇 Add this block
    {
        files: ["app/**/*.{js,ts,jsx,tsx}"],
        rules: {
            // Ignore unused exports for Expo Router pages
            "import/no-unused-modules": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { varsIgnorePattern: "Page|default" }, // Avoid false positives
            ],
        },
    },
]);

