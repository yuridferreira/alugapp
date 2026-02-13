// Minimal ESLint flat config (eslint v9+/v10+) — keep it simple so `expo lint` can run.
// Uses the "flat" config format: export an array of config entries.
module.exports = [
  {
    // ignore node_modules by default
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    // rules can be tuned later; start with ESLint defaults (no explicit extends here)
    rules: {},
  },
];
