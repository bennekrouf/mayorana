#!/usr/bin/env node
// Builds every runnable Rust example in the blog on the Rust Playground — the
// ones a reader can click Run on — and lists those that fail.
//
//   node scripts/check-snippets.js                 every post, both locales
//   node scripts/check-snippets.js en              one locale
//   node scripts/check-snippets.js content/en/blog/foo.md
//
// Not part of the build: it calls a shared community service, one request at
// a time with a pause between, so a full run takes a few minutes. A failure is
// not always a bug — plenty of posts show code that does not compile on
// purpose; mark those fences ```rust,compile_fail (expected to fail) or
// ```rust,ignore (no Run button) and they stop being reported.

const fs = require('fs');
const path = require('path');
const ContentValidator = require('./content-validator');

const PAUSE_MS = 1500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function filesFor(arg) {
  if (arg && arg.endsWith('.md')) return [arg];
  const locales = arg ? [arg] : ['en', 'fr'];
  return locales.flatMap((locale) => {
    const dir = path.join(process.cwd(), 'content', locale, 'blog');
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f));
  });
}

async function main() {
  const validator = new ContentValidator();
  const failures = [];
  let checked = 0;

  for (const file of filesFor(process.argv[2])) {
    const snippets = validator.extractRunnableSnippets(fs.readFileSync(file, 'utf8'));
    for (const snippet of snippets) {
      const where = `${path.relative(process.cwd(), file)}:${snippet.line}`;
      try {
        const result = await validator.runSnippet(snippet);
        checked++;
        if (!result.expected) {
          const firstError = result.stderr.split('\n').find((l) => /^error/.test(l)) || '(ran, but was marked compile_fail)';
          failures.push(`${where}  ${firstError}`);
          console.log(`❌ ${where}`);
        } else {
          console.log(`✅ ${where}`);
        }
      } catch (error) {
        failures.push(`${where}  could not reach the Playground: ${error.message}`);
        console.log(`⚠️  ${where}`);
      }
      await sleep(PAUSE_MS);
    }
  }

  console.log(`\n${checked} snippets built, ${failures.length} failing:`);
  failures.forEach((f) => console.log(`  ${f}`));
  process.exit(failures.length ? 1 : 0);
}

main();
