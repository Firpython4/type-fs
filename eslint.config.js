// eslint.config.js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    // Base configuration for JavaScript
    {
        ...js.configs.recommended,
        ignores: ["dist/*", "node_modules/*", "src/examples/*"],
    },
    // TypeScript-specific configuration
    {
        ignores: ["dist/*", "node_modules/*", "src/examples/*"],
        files: ["**/*.ts", "**/*.tsx"], // Specify TypeScript files
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest", // Use the latest ECMAScript standard
                sourceType: "module", // Specify ES Modules
                project: "./tsconfig.json", // Point to your tsconfig.json
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules, // Recommended TypeScript rules
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },

    // Additional configuration for TypeScript files in tests (optional)
    {
        files: ["**/*.test.ts", "**/*.spec.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off", // Relax rules for tests
        },
    },
];
