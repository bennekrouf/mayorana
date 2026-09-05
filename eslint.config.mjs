// Flat config for ESLint 9.
//
// This previously went through FlatCompat, which pushes eslint-config-next
// back through the legacy eslintrc validator — and that validator JSON
// stringifies the config to format errors, which throws on the circular
// plugin references the Next config contains ("Converting circular structure
// to JSON"). eslint-config-next 16 exports flat configs directly, so the
// compatibility layer is not needed and the whole failure goes away.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Generated and vendored output — not ours to lint.
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'public/**'],
  },
  {
    rules: {
      // Carried over from the old .eslintrc.js: prose in JSX uses real
      // apostrophes, particularly in the French copy.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // Build and tooling scripts are plain CommonJS run by Node, not TypeScript
    // modules. The typescript-eslint recommended set was flagging every
    // require() in them, which is simply how CommonJS works.
    files: ['scripts/**/*.js', 'server.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
