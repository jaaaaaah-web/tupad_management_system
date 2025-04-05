module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    // Disable specific rules that might be too strict for your project
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn",
    "@next/next/no-img-element": "warn",
    "react/no-unescaped-entities": "off"
  }
}