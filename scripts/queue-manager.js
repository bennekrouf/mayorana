// Minimal Queue Manager - Only what you actually need
// File: scripts/queue-manager.js

const fs = require('fs');
const path = require('path');

class QueueManager {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Get today's target locale (alternating EN/FR)
   */
  getTodaysTargetLocale() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return dayOfYear % 2 === 0 ? 'en' : 'fr';
  }

  /**
   * Count files in a directory
   */
  countFiles(directory) {
    if (!fs.existsSync(directory)) return 0;
    return fs.readdirSync(directory).filter(f => f.endsWith('.md')).length;
  }

  /**
   * Get simple status for CLI
   */
  getStatus() {
    const targetLocale = this.getTodaysTargetLocale();
    const fallbackLocale = targetLocale === 'en' ? 'fr' : 'en';

    const enQueued = this.countFiles(`content/en/queue`);
    const frQueued = this.countFiles(`content/fr/queue`);
    const enPublished = this.countFiles(`content/en/blog`);
    const frPublished = this.countFiles(`content/fr/blog`);

    const targetCount = targetLocale === 'en' ? enQueued : frQueued;
    const fallbackCount = targetLocale === 'en' ? frQueued : enQueued;

    return {
      // Today's publishing
      targetLocale: targetLocale.toUpperCase(),
      targetCount,
      fallbackLocale: fallbackLocale.toUpperCase(),
      fallbackCount,
      canPublish: targetCount > 0 || fallbackCount > 0,
      willUseTarget: targetCount > 0,

      // Overall stats
      totalQueued: enQueued + frQueued,
      totalPublished: enPublished + frPublished,
      enQueued,
      frQueued,
      enPublished,
      frPublished
    };
  }
}

module.exports = QueueManager;
