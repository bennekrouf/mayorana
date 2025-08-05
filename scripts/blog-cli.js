#!/usr/bin/env node
// Universal Multi-Language CLI - Works with any configured languages
// File: scripts/blog-cli.js

const MultiLanguagePublisher = require('./multi-lang-publisher');
const fs = require('fs');
const path = require('path');

class UniversalBlogCLI {
  constructor() {
    this.publisher = new MultiLanguagePublisher();
    this.languages = this.publisher.getAllLanguages();
  }

  async run() {
    const command = process.argv[2] || 'status';
    const args = process.argv.slice(3);

    try {
      switch (command) {
        case 'status':
          this.showStatus();
          break;
        case 'languages':
          this.showLanguages();
          break;
        case 'preview':
          this.showPreview(parseInt(args[0]) || 7);
          break;
        case 'report':
          this.showReport();
          break;
        case 'queue':
          await this.handleQueueCommand(args);
          break;
        case 'publish':
          await this.handlePublishCommand(args);
          break;
        case 'test':
          await this.testPublish(args[0]);
          break;
        case 'config':
          this.showConfig();
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  showStatus() {
    const status = this.publisher.getOverallStatus();

    console.log('\n🌍 Multi-Language Publishing Status\n' + '='.repeat(40));

    // Overall summary
    console.log(`📊 Overview:`);
    console.log(`   Languages configured: ${status.totalLanguages}`);
    console.log(`   Languages with content: ${status.languagesWithContent.length} (${status.languagesWithContent.join(', ')})`);
    console.log(`   Total queued: ${status.totalQueued} articles`);
    console.log(`   Total published: ${status.totalPublished} articles`);
    console.log(`   Strategy: ${status.publishStrategy}`);

    // Per-language breakdown
    console.log(`\n📋 Language Breakdown:`);
    for (const [code, lang] of Object.entries(status.languageStatus)) {
      const bufferIcon = lang.bufferCritical ? '🔴' : lang.bufferHealthy ? '🟢' : '🟡';
      const publishIcon = lang.canPublish ? '✅' : '❌';
      
      console.log(`   ${code.toUpperCase()} (${lang.name}): ${publishIcon} ${bufferIcon}`);
      console.log(`      Queued: ${lang.queued}, Published: ${lang.published}`);
      
      if (lang.nextArticle && !lang.nextArticle.error) {
        console.log(`      Next: "${lang.nextArticle.title}"`);
      }
    }

    // Today's publishing plan
    console.log(`\n🚀 Today's Publishing Plan:`);
    if (status.canPublishAny) {
      console.log(`   Will attempt: ${status.languagesWithContent.join(' + ')}`);
      console.log(`   Expected publications: ${status.languagesWithContent.length}`);
    } else {
      console.log('   ❌ No content available for publishing');
    }
  }

  showLanguages() {
    console.log('\n🌍 Configured Languages\n' + '='.repeat(40));
    
    const primary = this.publisher.config.languages?.primary || [];
    const secondary = this.publisher.config.languages?.secondary || [];

    if (primary.length > 0) {
      console.log('🎯 Primary Languages (always attempt to publish):');
      primary.forEach(lang => {
        console.log(`   ${lang.code.toUpperCase()} - ${lang.name} (Priority: ${lang.priority})`);
      });
    }

    if (secondary.length > 0) {
      console.log('\n🔄 Secondary Languages (publish if content available):');
      secondary.forEach(lang => {
        console.log(`   ${lang.code.toUpperCase()} - ${lang.name} (Priority: ${lang.priority})`);
      });
    }

    console.log(`\n📊 Total: ${this.languages.length} languages configured`);
    console.log(`Strategy: ${this.publisher.config.publishing?.strategy || 'all'}`);
  }

  showPreview(days) {
    console.log(`\n📅 ${days}-Day Publishing Preview\n` + '='.repeat(40));

    const status = this.publisher.getOverallStatus();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      const canPublish = [];
      let totalExpected = 0;

      // Check each language
      for (const [code, lang] of Object.entries(status.languageStatus)) {
        const remaining = Math.max(0, lang.queued - i);
        if (remaining > 0) {
          canPublish.push(code.toUpperCase());
          totalExpected++;
        }
      }

      const marker = i === 0 ? '👉' : '  ';
      const publishStr = canPublish.length > 0 ? canPublish.join(' + ') : 'None';
      
      console.log(`${marker} ${dateStr} (${dayName}): ${publishStr} (${totalExpected} articles)`);
    }

    const totalPossible = Array.from({length: days}, (_, i) => {
      return Object.values(status.languageStatus).reduce((sum, lang) => {
        return sum + (Math.max(0, lang.queued - i) > 0 ? 1 : 0);
      }, 0);
    }).reduce((a, b) => a + b, 0);

    console.log(`\n📊 Expected publications over ${days} days: ${totalPossible}`);
  }

  showReport() {
    console.log(this.publisher.generateReport());
  }

  showConfig() {
    const config = this.publisher.config;
    
    console.log('\n⚙️  Current Configuration\n' + '='.repeat(40));
    
    console.log('🌍 Languages:');
    this.languages.forEach(lang => {
      const type = config.languages?.primary?.find(l => l.code === lang.code) ? 'Primary' : 'Secondary';
      console.log(`   ${lang.code.toUpperCase()} (${lang.name}) - ${type}, Priority: ${lang.priority}`);
    });

    console.log('\n📝 Publishing Settings:');
    console.log(`   Strategy: ${config.publishing?.strategy || 'all'}`);
    console.log(`   Max per language per day: ${config.publishing?.maxPerLanguagePerDay || 1}`);
    console.log(`   Publish time: ${config.publishing?.publishTime || '09:00'}`);
    console.log(`   Skip weekends: ${config.publishing?.skipWeekends || true}`);
    console.log(`   Min buffer per language: ${config.publishing?.minBufferPerLanguage || 3}`);

    console.log('\n📊 Buffer Health Thresholds:');
    console.log(`   🟢 Healthy: >= ${config.publishing?.minBufferPerLanguage || 3} articles`);
    console.log(`   🟡 Low: < ${config.publishing?.minBufferPerLanguage || 3} articles`);
    console.log(`   🔴 Critical: <= ${config.publishing?.criticalBufferPerLanguage || 1} articles`);
  }

  async handleQueueCommand(args) {
    const subCommand = args[0];
    
    switch (subCommand) {
      case 'add':
        await this.queueAdd(args[1], args[2]);
        break;
      case 'list':
        this.queueList(args[1]);
        break;
      case 'status':
        this.queueStatus();
        break;
      default:
        console.log('Queue commands:');
        console.log('  add <file> <language>    - Add article to queue');
        console.log('  list [language]          - List queue contents');
        console.log('  status                   - Show queue status for all languages');
        console.log('');
        console.log('Available languages:', this.languages.map(l => l.code).join(', '));
    }
  }

  async queueAdd(filePath, languageCode) {
    if (!filePath) {
      console.log('❌ Please provide a file path');
      console.log('Usage: blog-cli queue add <file> <language>');
      console.log(`Available languages: ${this.languages.map(l => l.code).join(', ')}`);
      return;
    }

    if (!languageCode) {
      console.log('❌ Please specify a language');
      console.log(`Available languages: ${this.languages.map(l => l.code).join(', ')}`);
      return;
    }

    const validLanguages = this.languages.map(l => l.code);
    if (!validLanguages.includes(languageCode)) {
      console.log(`❌ Invalid language: ${languageCode}`);
      console.log(`Available languages: ${validLanguages.join(', ')}`);
      return;
    }

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    try {
      const queueDir = path.join(process.cwd(), `content/${languageCode}/queue`);
      
      // Ensure queue directory exists
      if (!fs.existsSync(queueDir)) {
        fs.mkdirSync(queueDir, { recursive: true });
        console.log(`📁 Created queue directory: ${queueDir}`);
      }

      const fileName = path.basename(filePath);
      const targetPath = path.join(queueDir, fileName);

      // Copy file to queue
      fs.copyFileSync(filePath, targetPath);

      const langName = this.languages.find(l => l.code === languageCode)?.name || languageCode;
      console.log(`✅ Article queued for ${langName} (${languageCode.toUpperCase()})`);
      console.log(`📁 Queued to: ${targetPath}`);
    } catch (error) {
      console.log(`❌ Failed to queue article: ${error.message}`);
    }
  }

  queueList(languageCode) {
    const status = this.publisher.getLanguageStatus();
    
    if (languageCode) {
      const validLanguages = this.languages.map(l => l.code);
      if (!validLanguages.includes(languageCode)) {
        console.log(`❌ Invalid language: ${languageCode}`);
        console.log(`Available languages: ${validLanguages.join(', ')}`);
        return;
      }

      this.showLanguageQueue(languageCode, status[languageCode]);
    } else {
      // Show all queues
      console.log('\n📚 All Language Queues\n' + '='.repeat(40));
      
      for (const lang of this.languages) {
        this.showLanguageQueue(lang.code, status[lang.code]);
      }
    }
  }

  showLanguageQueue(languageCode, langStatus) {
    const langName = this.languages.find(l => l.code === languageCode)?.name || languageCode;
    
    console.log(`\n📄 ${languageCode.toUpperCase()} (${langName}) Queue:`);
    
    if (!langStatus || langStatus.queued === 0) {
      console.log('   (empty)');
      return;
    }

    // Get detailed queue info
    const queueDir = path.join(process.cwd(), `content/${languageCode}/queue`);
    if (!fs.existsSync(queueDir)) {
      console.log('   (directory not found)');
      return;
    }

    const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
    files.forEach((file, index) => {
      try {
        const filePath = path.join(queueDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const matter = require('gray-matter');
        const { data } = matter(content);
        
        console.log(`   ${index + 1}. "${data.title || file.replace('.md', '')}" (${file})`);
        if (data.date) console.log(`      Date: ${data.date}`);
        if (data.priority && data.priority !== 'normal') console.log(`      Priority: ${data.priority}`);
      } catch (error) {
        console.log(`   ${index + 1}. ${file} (error reading frontmatter)`);
      }
    });
  }

  queueStatus() {
    const status = this.publisher.getLanguageStatus();
    
    console.log('\n📊 Queue Status Summary\n' + '='.repeat(40));
    
    let totalQueued = 0;
    let healthyLanguages = 0;
    let criticalLanguages = 0;

    for (const [code, lang] of Object.entries(status)) {
      totalQueued += lang.queued;
      if (lang.bufferHealthy) healthyLanguages++;
      if (lang.bufferCritical) criticalLanguages++;
      
      const bufferIcon = lang.bufferCritical ? '🔴' : lang.bufferHealthy ? '🟢' : '🟡';
      console.log(`${bufferIcon} ${code.toUpperCase()}: ${lang.queued} queued, ${lang.published} published`);
    }

    console.log('\n📈 Summary:');
    console.log(`   Total articles queued: ${totalQueued}`);
    console.log(`   Languages with healthy buffers: ${healthyLanguages}/${this.languages.length}`);
    console.log(`   Languages with critical buffers: ${criticalLanguages}/${this.languages.length}`);
  }

  async handlePublishCommand(args) {
    const languageCode = args[0];
    
    if (languageCode) {
      const validLanguages = this.languages.map(l => l.code);
      if (!validLanguages.includes(languageCode)) {
        console.log(`❌ Invalid language: ${languageCode}`);
        console.log(`Available languages: ${validLanguages.join(', ')}`);
        return;
      }

      // Publish specific language
      console.log(`🚀 Publishing for ${languageCode.toUpperCase()}...`);
      const result = await this.publisher.publishForLanguage(languageCode);
      
      if (result.success) {
        console.log(`✅ Successfully published: "${result.title}"`);
      } else {
        console.log(`❌ Publishing failed: ${result.reason}`);
      }
    } else {
      // Publish all languages
      console.log('🚀 Publishing for all configured languages...');
      const results = await this.publisher.publishAll();
      
      console.log('\n📊 Results:');
      console.log(`✅ Successfully published: ${results.totalPublished} articles`);
      
      if (results.published.length > 0) {
        console.log('📝 Published articles:');
        results.published.forEach(article => console.log(`   - ${article}`));
      }
    }
  }

  async testPublish(languageCode) {
    const status = this.publisher.getLanguageStatus();
    
    console.log('\n🧪 Publishing Test\n' + '='.repeat(40));

    if (languageCode) {
      const validLanguages = this.languages.map(l => l.code);
      if (!validLanguages.includes(languageCode)) {
        console.log(`❌ Invalid language: ${languageCode}`);
        console.log(`Available languages: ${validLanguages.join(', ')}`);
        return;
      }

      this.testLanguage(languageCode, status[languageCode]);
    } else {
      // Test all languages
      for (const lang of this.languages) {
        this.testLanguage(lang.code, status[lang.code]);
      }
    }

    console.log('\n💡 To actually publish:');
    console.log('   All languages: blog-cli publish');
    console.log('   Specific language: blog-cli publish <language>');
    console.log('   Daily script: ./scripts/daily-publish.sh');
  }

  testLanguage(languageCode, langStatus) {
    const langName = this.languages.find(l => l.code === languageCode)?.name || languageCode;
    
    console.log(`\n📝 ${languageCode.toUpperCase()} (${langName}):`);
    
    if (langStatus.canPublish) {
      console.log(`   ✅ Can publish (${langStatus.queued} articles in queue)`);
      if (langStatus.nextArticle && !langStatus.nextArticle.error) {
        console.log(`   Next article: "${langStatus.nextArticle.title}"`);
      }
    } else {
      console.log(`   ❌ Cannot publish (queue empty)`);
    }

    // Buffer health
    const bufferStatus = langStatus.bufferCritical ? 'CRITICAL 🔴' : 
                        langStatus.bufferHealthy ? 'HEALTHY 🟢' : 'LOW 🟡';
    console.log(`   Buffer: ${bufferStatus}`);
  }

  showHelp() {
    console.log(`
🌍 Universal Multi-Language Blog CLI

USAGE:
  node scripts/blog-cli.js [command] [options]

COMMANDS:
  status                      Show publishing status for all languages (default)
  languages                   Show configured languages
  preview [days]              Show publishing preview (default: 7 days)  
  report                      Show detailed report
  config                      Show current configuration
  
  queue add <file> <lang>     Add article to language queue
  queue list [lang]           List queue contents (all languages or specific)
  queue status                Show queue status summary
  
  publish [lang]              Publish articles (all languages or specific)
  test [lang]                 Test publishing capability
  
  help                        Show this help

EXAMPLES:
  blog-cli status
  blog-cli languages
  blog-cli preview 14
  blog-cli queue add article.md en
  blog-cli queue list fr
  blog-cli queue status
  blog-cli publish en
  blog-cli test

CONFIGURATION:
  Edit config/publishing.yaml to add/remove languages and adjust settings.
  
  Current languages: ${this.languages.map(l => l.code.toUpperCase()).join(', ')}
  
WORKFLOW:
  1. Write articles in content/drafts/
  2. Queue them: blog-cli queue add article.md <language>
  3. Check status: blog-cli status
  4. Test: blog-cli test
  5. Daily script auto-publishes: ./scripts/daily-publish.sh

EMERGENCY CONTROLS:
  touch .publishing-paused    # Pause all publishing
  touch .skip-today          # Skip today only  
  rm .publishing-paused      # Resume publishing
`);
  }
}

// Run CLI
if (require.main === module) {
  const cli = new UniversalBlogCLI();
  cli.run().catch(console.error);
}

module.exports = UniversalBlogCLI;
