#!/usr/bin/env node
// Simple Publisher - Just publish one article from any language

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

class SimplePublisher {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.languages = this.config.languages || ['en', 'fr'];
  }

  loadConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'config/publishing.yaml');
      const configContent = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      console.warn('⚠️  Config not found, using defaults');
      return {
        languages: ['en', 'fr'],
        publishing: { maxPerDay: 1 }
      };
    }
  }

  // Count files in a directory
  countFiles(directory) {
    if (!fs.existsSync(directory)) return 0;
    return fs.readdirSync(directory).filter(f => f.endsWith('.md')).length;
  }

  // Get status for all languages
  getStatus() {
    const status = {};

    for (const lang of this.languages) {
      const queueDir = path.join(this.projectRoot, `content/${lang}/queue`);
      const blogDir = path.join(this.projectRoot, `content/${lang}/blog`);

      status[lang] = {
        queued: this.countFiles(queueDir),
        published: this.countFiles(blogDir),
        canPublish: this.countFiles(queueDir) > 0
      };
    }

    return status;
  }

  // Find the first available article from any language
  findNextArticle() {
    for (const lang of this.languages) {
      const queueDir = path.join(this.projectRoot, `content/${lang}/queue`);

      if (!fs.existsSync(queueDir)) continue;

      const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
      if (files.length > 0) {
        return {
          language: lang,
          filename: files[0],
          queuePath: path.join(queueDir, files[0]),
          targetPath: path.join(this.projectRoot, `content/${lang}/blog`, files[0])
        };
      }
    }

    return null;
  }

  // Publish one article
  async publishOne() {
    console.log('🔍 Looking for articles to publish...');

    const article = this.findNextArticle();

    if (!article) {
      console.log('📭 No articles found in any queue');
      return { success: false, reason: 'no_articles' };
    }

    console.log(`📝 Publishing: ${article.filename} (${article.language.toUpperCase()})`);

    try {
      // Ensure target directory exists
      const targetDir = path.dirname(article.targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Read and process the file
      const fileContents = fs.readFileSync(article.queuePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Fix the locale to match directory
      data.locale = article.language;

      // Update date to today
      const today = new Date().toISOString().split('T')[0];
      data.date = today;

      // Clean up scheduling metadata
      delete data.scheduledFor;
      delete data.scheduledAt;
      delete data.queuedAt;
      delete data.priority;

      // Write to blog directory
      const updatedContent = matter.stringify(content, data);
      fs.writeFileSync(article.targetPath, updatedContent);

      // Remove from queue
      fs.unlinkSync(article.queuePath);

      console.log(`✅ Published: "${data.title}" (${article.language.toUpperCase()})`);

      return {
        success: true,
        title: data.title,
        language: article.language,
        filename: article.filename
      };

    } catch (error) {
      console.error(`❌ Error publishing: ${error.message}`);
      return { success: false, reason: 'processing_error', error: error.message };
    }
  }

  // Show status
  showStatus() {
    const status = this.getStatus();

    console.log('\n📊 Publishing Status');
    console.log('='.repeat(30));

    let totalQueued = 0;
    let languagesWithContent = [];

    for (const [lang, data] of Object.entries(status)) {
      totalQueued += data.queued;
      if (data.canPublish) languagesWithContent.push(lang.toUpperCase());

      console.log(`${lang.toUpperCase()}: ${data.queued} queued, ${data.published} published`);
    }

    console.log(`\nTotal queued: ${totalQueued}`);
    console.log(`Can publish: ${languagesWithContent.join(', ') || 'None'}`);

    return status;
  }
}

// CLI
async function main() {
  const publisher = new SimplePublisher();
  const command = process.argv[2] || 'status';

  try {
    switch (command) {
      case 'status':
        publisher.showStatus();
        break;

      case 'publish':
        const result = await publisher.publishOne();
        if (result.success) {
          console.log(`\n🎉 Published: "${result.title}" (${result.language.toUpperCase()})`);
        } else {
          console.log(`\n❌ Failed: ${result.reason}`);
          if (result.error) console.log(`Error: ${result.error}`);
        }
        break;

      case 'test':
        console.log('🧪 Testing...');
        const next = publisher.findNextArticle();
        if (next) {
          console.log(`Next article: ${next.filename} (${next.language.toUpperCase()})`);
        } else {
          console.log('No articles ready to publish');
        }
        break;

      default:
        console.log(`
Simple Publisher

USAGE:
  node scripts/publisher.js [command]

COMMANDS:
  status    Show current status (default)
  publish   Publish one article
  test      Show what would be published

EXAMPLES:
  node scripts/publisher.js status
  node scripts/publisher.js publish
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimplePublisher;
