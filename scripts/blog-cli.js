#!/usr/bin/env node
// Simple Blog CLI - Replace the complex multi-language one

const fs = require('fs');
const path = require('path');
const SimplePublisher = require('./publisher');

class SimpleBlogCLI {
  constructor() {
    this.publisher = new SimplePublisher();
    this.languages = this.publisher.languages;
  }

  // Add article to queue
  async queueAdd(filePath, language) {
    if (!filePath) {
      console.log('❌ Please provide a file path');
      console.log(`Usage: blog-cli queue <file> <language>`);
      console.log(`Available languages: ${this.languages.join(', ')}`);
      return;
    }

    if (!language) {
      console.log('❌ Please specify a language');
      console.log(`Available languages: ${this.languages.join(', ')}`);
      return;
    }

    if (!this.languages.includes(language)) {
      console.log(`❌ Invalid language: ${language}`);
      console.log(`Available languages: ${this.languages.join(', ')}`);
      return;
    }

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    try {
      const queueDir = path.join(process.cwd(), `content/${language}/queue`);

      // Ensure queue directory exists
      if (!fs.existsSync(queueDir)) {
        fs.mkdirSync(queueDir, { recursive: true });
        console.log(`📁 Created: ${queueDir}`);
      }

      const fileName = path.basename(filePath);
      const targetPath = path.join(queueDir, fileName);

      // Copy file to queue
      fs.copyFileSync(filePath, targetPath);

      console.log(`✅ Queued: ${fileName} → ${language.toUpperCase()}`);
      console.log(`📁 Location: ${targetPath}`);
    } catch (error) {
      console.log(`❌ Failed to queue: ${error.message}`);
    }
  }

  // List queue contents
  listQueue(language) {
    if (language && !this.languages.includes(language)) {
      console.log(`❌ Invalid language: ${language}`);
      console.log(`Available languages: ${this.languages.join(', ')}`);
      return;
    }

    const languagesToShow = language ? [language] : this.languages;

    console.log('\n📚 Queue Contents');
    console.log('='.repeat(30));

    for (const lang of languagesToShow) {
      const queueDir = path.join(process.cwd(), `content/${lang}/queue`);
      console.log(`\n${lang.toUpperCase()} Queue:`);

      if (!fs.existsSync(queueDir)) {
        console.log('   (no queue directory)');
        continue;
      }

      const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));

      if (files.length === 0) {
        console.log('   (empty)');
        continue;
      }

      files.forEach((file, index) => {
        try {
          const filePath = path.join(queueDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const matter = require('gray-matter');
          const { data } = matter(content);

          console.log(`   ${index + 1}. "${data.title || file.replace('.md', '')}" (${file})`);
          if (data.date) console.log(`      📅 ${data.date}`);
        } catch (error) {
          console.log(`   ${index + 1}. ${file} (error reading)`);
        }
      });
    }
  }

  // Show preview of upcoming publications
  showPreview(days = 7) {
    console.log(`\n📅 ${days}-Day Preview`);
    console.log('='.repeat(30));

    const status = this.publisher.getStatus();
    const hasContent = Object.values(status).some(s => s.queued > 0);

    if (!hasContent) {
      console.log('📭 No articles queued for publishing');
      return;
    }

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Simple logic: if there are articles, show "1 article"
      const willPublish = hasContent && i < Object.values(status).reduce((sum, s) => sum + s.queued, 0);
      const marker = i === 0 ? '👉' : '  ';

      console.log(`${marker} ${dateStr} (${dayName}): ${willPublish ? '1 article' : 'None'}`);
    }
  }

  // Show help
  showHelp() {
    console.log(`
Simple Blog CLI

USAGE:
  node scripts/blog-cli.js [command] [options]

COMMANDS:
  status              Show publishing status (default)
  queue <file> <lang> Add article to language queue
  list [lang]         List queue contents (all or specific language)
  preview [days]      Show publishing preview (default: 7 days)
  publish             Publish one article
  test                Test what would be published
  help                Show this help

EXAMPLES:
  blog-cli status
  blog-cli queue article.md en
  blog-cli list fr
  blog-cli preview 14
  blog-cli publish

LANGUAGES:
  ${this.languages.map(l => l.toUpperCase()).join(', ')}

WORKFLOW:
  1. Write articles in content/drafts/
  2. Queue them: blog-cli queue article.md <language>
  3. Check status: blog-cli status
  4. Daily script auto-publishes: ./scripts/daily-publish.sh
`);
  }

  async run() {
    const command = process.argv[2] || 'status';
    const args = process.argv.slice(3);

    try {
      switch (command) {
        case 'status':
          this.publisher.showStatus();
          break;

        case 'queue':
          await this.queueAdd(args[0], args[1]);
          break;

        case 'list':
          this.listQueue(args[0]);
          break;

        case 'preview':
          this.showPreview(parseInt(args[0]) || 7);
          break;

        case 'publish':
          const result = await this.publisher.publishBoth();
          if (result.success) {
            console.log(`\n🎉 Published: "${result.title}" (${result.language.toUpperCase()})`);
          } else {
            console.log(`\n❌ Failed: ${result.reason}`);
          }
          break;

        case 'test':
          console.log('🧪 Testing...');
          const next = this.publisher.findNextArticle();
          if (next) {
            console.log(`Next: ${next.filename} (${next.language.toUpperCase()})`);
          } else {
            console.log('No articles ready');
          }
          break;

        case 'help':
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const cli = new SimpleBlogCLI();
  cli.run();
}

module.exports = SimpleBlogCLI;
