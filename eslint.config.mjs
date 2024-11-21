import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/.cache",
        "**/.config",
        "**/.local",
        "src/set-operations-for-spotify",
        "src/typewriter-formatting",
        "src/cah-maker",
        "src/response-display",
        "src/password-generator",
        "src/recipes",
        "src/dvd",
    ],
}, ...compat.extends("prettier"), {
    languageOptions: {
        globals: {},
    },
}];