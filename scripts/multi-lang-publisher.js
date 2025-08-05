#!/usr/bin/env node
// Multi-Language Publisher - Scalable for any number of languages
// File: scripts/multi-lang-publisher.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

class MultiLanguagePublisher {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.languages = this.getAllLanguages();
  }

  loadConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'config/publishing.yaml');
      const configContent = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      console.error('❌ Error loading config:', error.message);
      // Fallback config
      return {
        languages: {
          primary: [
            { code: 'en', name: 'English', priority: 1 },
            { code: 'fr', name: 'Français', priority: 1 }
          ],
          secondary: []
        },
        publishing: {
          strategy: 'all',
          maxPerLanguagePerDay: 1
        }
      };
    }
  }

  getAllLanguages() {
    const primary = this.config.languages?.primary || [];
    const secondary = this.config.languages?.secondary || [];
    return [...primary, ...secondary].sort((a, b) => a.priority - b.priority);
  }

  getLanguagesToPublish() {
    if (this.config.publishing?.strategy === 'primary') {
      return this.config.languages?.primary || [];
    }
    return this.getAllLanguages();
  }

  countQueueFiles(languageCode) {
    const queueDir = path.join(this.projectRoot, `content/${languageCode}/queue`);
    if (!fs.existsSync(queueDir)) return 0;
    return fs.readdirSync(queueDir).filter(f => f.endsWith('.md')).length;
  }

  countPublishedFiles(languageCode) {
    const blogDir = path.join(this.projectRoot, `content/${languageCode}/blog`);
    if (!fs.existsSync(blogDir)) return 0;
    return fs.readdirSync(blogDir).filter(f => f.endsWith('.md')).length;
  }

  getLanguageStatus() {
    const status = {};
    
    for (const lang of this.languages) {
      const queued = this.countQueueFiles(lang.code);
      const published = this.countPublishedFiles(lang.code);
      const minBuffer = this.config.publishing?.minBufferPerLanguage || 3;
      const criticalBuffer = this.config.publishing?.criticalBufferPerLanguage || 1;

      status[lang.code] = {
        name: lang.name,
        priority: lang.priority,
        queued,
        published,
        canPublish: queued > 0,
        bufferHealthy: queued >= minBuffer,
        bufferCritical: queued <= criticalBuffer,
        nextArticle: this.getNextArticle(lang.code)
      };
    }

    return status;
  }

  getNextArticle(languageCode) {
    const queueDir = path.join(this.projectRoot, `content/${languageCode}/queue`);
    if (!fs.existsSync(queueDir)) return null;

    const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) return null;

    try {
      const filePath = path.join(queueDir, files[0]);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(content);
      
      return {
        filename: files[0],
        title: data.title || files[0].replace('.md', ''),
        slug: data.slug,
        date: data.date,
        priority: data.priority || 'normal'
      };
    } catch (error) {
      return {
        filename: files[0],
        title: files[0].replace('.md', ''),
        error: true
      };
    }
  }

  async publishForLanguage(languageCode) {
    const queueDir = path.join(this.projectRoot, `content/${languageCode}/queue`);
    const blogDir = path.join(this.projectRoot, `content/${languageCode}/blog`);
    
    console.log(`📝 Publishing for ${languageCode.toUpperCase()}...`);

    // Check if queue exists and has content
    if (!fs.existsSync(queueDir)) {
      console.log(`❌ Queue directory doesn't exist: ${queueDir}`);
      return { success: false, reason: 'no_queue_dir' };
    }

    const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      console.log(`📭 No files in ${languageCode.toUpperCase()} queue`);
      return { success: false, reason: 'empty_queue' };
    }

    // Ensure blog directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
      console.log(`📁 Created blog directory: ${blogDir}`);
    }

    const fileName = files[0];
    const sourcePath = path.join(queueDir, fileName);
    const targetPath = path.join(blogDir, fileName);

    try {
      // Read and process the file
      const fileContents = fs.readFileSync(sourcePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Ensure locale matches directory
      data.locale = languageCode;

      // Update date to today
      const today = new Date().toISOString().split('T')[0];
      data.date = today;

      // Clean up scheduling metadata
      delete data.scheduledFor;
      delete data.scheduledAt;
      delete data.queuedAt;
      delete data.priority;

      console.log(`📄 Processing: "${data.title}" (${fileName})`);

      // Write to blog directory
      const updatedContent = matter.stringify(content, data);
      fs.writeFileSync(targetPath, updatedContent);

      // Remove from queue
      fs.unlinkSync(sourcePath);

      console.log(`✅ Published ${languageCode.toUpperCase()}: "${data.title}"`);
      
      return {
        success: true,
        title: data.title,
        slug: data.slug,
        filename: fileName,
        language: languageCode
      };

    } catch (error) {
      console.error(`❌ Error publishing ${languageCode.toUpperCase()}:`, error.message);
      return { success: false, reason: 'processing_error', error: error.message };
    }
  }

  async publishAll() {
    console.log('🚀 Starting multi-language publishing...\n');
    
    const languagesToPublish = this.getLanguagesToPublish();
    const maxPerLanguage = this.config.publishing?.maxPerLanguagePerDay || 1;
    
    console.log(`🎯 Target languages: ${languagesToPublish.map(l => l.code.toUpperCase()).join(', ')}`);
    console.log(`📊 Max per language: ${maxPerLanguage}\n`);

    const results = [];
    const published = [];

    for (const lang of languagesToPublish) {
      for (let i = 0; i < maxPerLanguage; i++) {
        const result = await this.publishForLanguage(lang.code);
        results.push({ ...result, language: lang.code, languageName: lang.name });
        
        if (result.success) {
          published.push(`${lang.code.toUpperCase()}: "${result.title}"`);
        }
        
        // If this language has no more content, break
        if (!result.success && result.reason === 'empty_queue') {
          break;
        }
      }
    }

    return {
      results,
      published,
      totalPublished: published.length,
      summary: this.generateSummary(results)
    };
  }

  generateSummary(results) {
    const summary = {
      successful: [],
      failed: [],
      byLanguage: {}
    };

    for (const result of results) {
      const langCode = result.language;
      
      if (!summary.byLanguage[langCode]) {
        summary.byLanguage[langCode] = {
          name: result.languageName,
          successful: 0,
          failed: 0,
          articles: []
        };
      }

      if (result.success) {
        summary.successful.push(result);
        summary.byLanguage[langCode].successful++;
        summary.byLanguage[langCode].articles.push(result.title);
      } else {
        summary.failed.push(result);
        summary.byLanguage[langCode].failed++;
      }
    }

    return summary;
  }

  getOverallStatus() {
    const languageStatus = this.getLanguageStatus();
    const totalQueued = Object.values(languageStatus).reduce((sum, lang) => sum + lang.queued, 0);
    const totalPublished = Object.values(languageStatus).reduce((sum, lang) => sum + lang.published, 0);
    const canPublishAny = Object.values(languageStatus).some(lang => lang.canPublish);
    const languagesWithContent = Object.entries(languageStatus)
      .filter(([_, lang]) => lang.canPublish)
      .map(([code, _]) => code.toUpperCase());

    return {
      languageStatus,
      totalQueued,
      totalPublished,
      canPublishAny,
      languagesWithContent,
      totalLanguages: this.languages.length,
      publishStrategy: this.config.publishing?.strategy || 'all'
    };
  }

  generateReport() {
    const status = this.getOverallStatus();
    
    let report = '\n📊 Multi-Language Publishing Status\n';
    report += '=' + '='.repeat(50) + '\n\n';

    // Overall stats
    report += `🌍 Languages: ${status.totalLanguages} configured, ${status.languagesWithContent.length} with content\n`;
    report += `📈 Total queued: ${status.totalQueued} articles\n`;
    report += `📚 Total published: ${status.totalPublished} articles\n`;
    report += `🎯 Strategy: ${status.publishStrategy}\n\n`;

    // Per-language breakdown
    report += '📋 Language Breakdown:\n';
    for (const [code, lang] of Object.entries(status.languageStatus)) {
      const bufferIcon = lang.bufferCritical ? '🔴' : lang.bufferHealthy ? '🟢' : '🟡';
      const publishIcon = lang.canPublish ? '✅' : '❌';
      
      report += `   ${code.toUpperCase()} (${lang.name}): ${publishIcon} ${bufferIcon}\n`;
      report += `      Queued: ${lang.queued}, Published: ${lang.published}\n`;
      
      if (lang.nextArticle && !lang.nextArticle.error) {
        report += `      Next: "${lang.nextArticle.title}"\n`;
      }
      report += '\n';
    }

    // Today's publishing plan
    if (status.canPublishAny) {
      report += `🚀 Today's Plan: ${status.languagesWithContent.join(' + ')}\n`;
    } else {
      report += '❌ Today\'s Plan: No content available\n';
    }

    return report;
  }
}

// CLI Interface
async function main() {
  const publisher = new MultiLanguagePublisher();
  const command = process.argv[2] || 'status';

  try {
    switch (command) {
      case 'status':
        console.log(publisher.generateReport());
        break;

      case 'publish':
        const results = await publisher.publishAll();
        
        console.log('\n📊 Publishing Results:');
        console.log(`✅ Successfully published: ${results.totalPublished} articles`);
        
        if (results.published.length > 0) {
          console.log('📝 Published articles:');
          results.published.forEach(article => console.log(`   - ${article}`));
        }
        
        if (results.summary.failed.length > 0) {
          console.log('\n⚠️  Failed attempts:');
          results.summary.failed.forEach(failure => {
            console.log(`   - ${failure.language.toUpperCase()}: ${failure.reason}`);
          });
        }
        break;

      case 'config':
        console.log('\n⚙️  Current Configuration:');
        console.log(`Languages: ${publisher.languages.length} configured`);
        publisher.languages.forEach(lang => {
          console.log(`   - ${lang.code.toUpperCase()} (${lang.name}) - Priority: ${lang.priority}`);
        });
        console.log(`Strategy: ${publisher.config.publishing?.strategy || 'all'}`);
        console.log(`Max per language: ${publisher.config.publishing?.maxPerLanguagePerDay || 1}`);
        break;

      default:
        console.log(`
🌍 Multi-Language Publisher

USAGE:
  node scripts/multi-lang-publisher.js [command]

COMMANDS:
  status    Show current status (default)
  publish   Publish articles for all configured languages
  config    Show current configuration

EXAMPLES:
  node scripts/multi-lang-publisher.js status
  node scripts/multi-lang-publisher.js publish
  node scripts/multi-lang-publisher.js config
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MultiLanguagePublisher;
