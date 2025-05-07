module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Disable the rule for unescaped entities
    'react/no-unescaped-entities': 'off',
  }
};
