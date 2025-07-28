#!/usr/bin/env node
// Minimal CLI - Just what you need
// File: scripts/blog-cli.js

const QueueManager = require('./queue-manager');

class BlogCLI {
  constructor() {
    this.queueManager = new QueueManager();
  }

  async run() {
    const command = process.argv[2] || 'status';

    if (command === 'status') {
      this.showStatus();
    } else {
      this.showHelp();
    }
  }

  showStatus() {
    const status = this.queueManager.getStatus();

    console.log('\n📊 Publishing Status\n' + '='.repeat(40));

    // Today's plan
    console.log(`🎯 Today: ${status.targetLocale} (${status.targetCount} available)`);

    if (!status.willUseTarget && status.fallbackCount > 0) {
      console.log(`🔄 Will use ${status.fallbackLocale} fallback (${status.fallbackCount} available)`);
    }

    if (!status.canPublish) {
      console.log('❌ Cannot publish - no content in any locale');
    }

    // Quick stats
    console.log(`\n📈 Queue: EN=${status.enQueued}, FR=${status.frQueued} (${status.totalQueued} total)`);
    console.log(`📚 Published: EN=${status.enPublished}, FR=${status.frPublished} (${status.totalPublished} total)`);
  }

  showHelp() {
    console.log(`
📚 Blog CLI

USAGE:
  node scripts/blog-cli.js [command]

COMMANDS:
  status    Show publishing status (default)
  help      Show this help

WORKFLOW:
  1. Write articles in content/en/queue/ or content/fr/queue/
  2. Run daily-publish.sh (alternates EN/FR automatically)
  3. Check status anytime with this CLI
`);
  }
}

// Run CLI
if (require.main === module) {
  const cli = new BlogCLI();
  cli.run().catch(console.error);
}

module.exports = BlogCLI;
