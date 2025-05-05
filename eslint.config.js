import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,vue}"], plugins: { js } },
  { files: ["**/*.{js,mjs,cjs,ts,vue}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    rules: {
      semi: ["error", "always"],  // 强制分号[1,3](@ref)
      // 可扩展其他规则，例如：
      "no-console": "warn"          // 使用 console 时警告
    }
  }
]);