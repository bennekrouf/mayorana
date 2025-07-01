#!/usr/bin/env node
// CLI Interface for Queue Management
// File: scripts/blog-cli.js

const QueueManager = require('./queue-manager');
const ContentValidator = require('./content-validator');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class BlogCLI {
  constructor() {
    this.queueManager = new QueueManager();
    this.validator = new ContentValidator();
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config/publishing.yaml');
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        return yaml.load(configFile);
      }
    } catch (error) {
      console.warn('⚠️  Could not load config, using defaults');
    }
    return {};
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'status':
          await this.showStatus();
          break;
        
        case 'queue':
          await this.handleQueueCommand(args.slice(1));
          break;
        
        case 'schedule':
          await this.handleScheduleCommand(args.slice(1));
          break;
        
        case 'validate':
          await this.handleValidateCommand(args.slice(1));
          break;
        
        case 'preview':
          await this.showPreview(parseInt(args[1]) || 14);
          break;
        
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  async showStatus() {
    console.log('\n📊 Blog Queue Status\n' + '='.repeat(50));
    
    const status = this.queueManager.getQueueStatus();
    
    console.log(`📝 Drafts:           ${status.drafts}`);
    console.log(`⏳ Queued:           ${status.queued}`);
    console.log(`📅 Scheduled:        ${status.scheduled}`);
    console.log(`✅ Published:        ${status.published}`);
    console.log(`🔄 Total Buffer:     ${status.totalBuffer}`);
    console.log(`📆 Next Scheduled:   ${status.nextScheduled}`);
    console.log(`📋 Upcoming Week:    ${status.upcomingWeek} articles`);
    
    if (status.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      status.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    // Buffer health
    console.log('\n🏥 Buffer Health:');
    if (status.totalBuffer >= 10) {
      console.log('   ✅ Healthy (10+ articles)');
    } else if (status.totalBuffer >= 5) {
      console.log('   ⚠️  Moderate (5-9 articles)');
    } else {
      console.log('   🚨 Low (< 5 articles)');
    }
  }

  async handleQueueCommand(args) {
    const subCommand = args[0];
    
    switch (subCommand) {
      case 'add':
        const filename = args[1];
        const priority = args[2] || 'normal';
        if (!filename) {
          throw new Error('Usage: queue add <filename> [priority]');
        }
        this.queueManager.moveToQueue(filename, priority);
        break;
      
      case 'list':
        await this.listQueued();
        break;
      
      case 'auto-schedule':
        const scheduled = this.queueManager.autoScheduleQueued();
        console.log(`✅ Auto-scheduled ${scheduled} articles`);
        break;
      
      default:
        console.log('Usage: queue <add|list|auto-schedule>');
        break;
    }
  }

  async handleScheduleCommand(args) {
    const filename = args[0];
    const date = args[1];
    
    if (!filename || !date) {
      throw new Error('Usage: schedule <filename> <YYYY-MM-DD>');
    }
    
    this.queueManager.scheduleArticle(filename, date);
  }

  async handleValidateCommand(args) {
    const target = args[0] || 'all';
    
    console.log('\n🔍 Content Validation\n' + '='.repeat(50));
    
    if (target === 'all') {
      const results = this.validator.validateAllContent();
      const report = this.validator.generateReport(results);
      console.log(report);
    } else {
      // Validate specific file
      const validation = this.validator.validateArticle(target);
      
      if (validation.valid) {
        console.log(`✅ ${target} is valid`);
      } else {
        console.log(`❌ ${target} has errors:`);
        validation.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      if (validation.warnings.length > 0) {
        console.log(`⚠️  Warnings:`);
        validation.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
    }
  }

  async listQueued() {
    const queued = this.queueManager.getQueuedArticles();
    const scheduled = this.queueManager.getScheduledArticles();
    
    console.log('\n📋 Queued Articles (Unscheduled)');
    console.log('-'.repeat(40));
    
    if (queued.length === 0) {
      console.log('   No unscheduled articles');
    } else {
      queued.forEach((article, index) => {
        const priority = article.data.priority || 'normal';
        const priorityIcon = priority === 'high' ? '🔥' : priority === 'low' ? '🔽' : '📝';
        console.log(`   ${priorityIcon} ${article.data.title} (${article.filename})`);
      });
    }
    
    console.log('\n📅 Scheduled Articles');
    console.log('-'.repeat(40));
    
    if (scheduled.length === 0) {
      console.log('   No scheduled articles');
    } else {
      scheduled.forEach(article => {
        const date = article.data.scheduledFor;
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        console.log(`   📆 ${date} (${dayOfWeek}) - ${article.data.title}`);
      });
    }
  }

  async showPreview(days) {
    console.log(`\n📅 Publishing Preview (Next ${days} days)\n` + '='.repeat(50));
    
    const preview = this.queueManager.previewSchedule(days);
    
    preview.forEach(day => {
      const dateObj = new Date(day.date);
      const isToday = day.date === new Date().toISOString().split('T')[0];
      const isTomorrow = day.date === new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      let dateLabel = day.date;
      if (isToday) dateLabel += ' (TODAY)';
      if (isTomorrow) dateLabel += ' (TOMORROW)';
      
      const dayIcon = day.article ? '📝' : '⭕';
      const priorityIcon = day.article?.priority === 'high' ? ' 🔥' : '';
      
      console.log(`${dayIcon} ${dateLabel} ${day.dayOfWeek}`);
      
      if (day.article) {
        console.log(`     ${day.article.title}${priorityIcon}`);
        console.log(`     (${day.article.filename})`);
      } else {
        console.log(`     No article scheduled`);
      }
      console.log('');
    });
    
    // Show summary
    const scheduledCount = preview.filter(day => day.article).length;
    const emptyDays = days - scheduledCount;
    
    console.log(`📊 Summary: ${scheduledCount} articles scheduled, ${emptyDays} empty days`);
    
    if (emptyDays > 0) {
      console.log('💡 Tip: Run "blog-cli queue auto-schedule" to fill empty slots');
    }
  }

  showHelp() {
    console.log(`
📚 Blog CLI - Content Management Tool

USAGE:
  node scripts/blog-cli.js <command> [options]

COMMANDS:
  status                           Show queue status and health
  queue add <file> [priority]      Move draft to queue (priority: high/normal/low)
  queue list                       List queued and scheduled articles  
  queue auto-schedule              Auto-schedule all queued articles
  schedule <file> <YYYY-MM-DD>     Schedule article for specific date
  validate [file|all]              Validate content (default: all)
  preview [days]                   Preview publishing schedule (default: 14 days)
  help                            Show this help

EXAMPLES:
  # Check status
  node scripts/blog-cli.js status
  
  # Add article to queue with high priority
  node scripts/blog-cli.js queue add "rust-macros.md" high
  
  # Schedule specific article
  node scripts/blog-cli.js schedule "advanced-traits.md" 2025-07-15
  
  # Auto-schedule all queued articles
  node scripts/blog-cli.js queue auto-schedule
  
  # Preview next 2 weeks
  node scripts/blog-cli.js preview 14
  
  # Validate all content
  node scripts/blog-cli.js validate

DIRECTORIES:
  content/drafts/     Your writing workspace
  content/queue/      Articles ready to publish  
  content/blog/       Published articles (live)

For more info, check: config/publishing.yaml
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new BlogCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = BlogCLI;
