// Queue Management Utilities with i18n support
// File: scripts/queue-manager.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class QueueManager {
  constructor() {
    // Support both old structure (for backward compatibility) and new i18n structure
    this.projectRoot = process.cwd();

    // Check if we have i18n structure
    const hasI18nStructure = fs.existsSync(path.join(this.projectRoot, 'content/en'));

    if (hasI18nStructure) {
      console.log('🌍 Using i18n structure');
      this.locales = ['en', 'fr'];
      this.queueDirs = {
        'en': path.join(this.projectRoot, 'content/en/queue'),
        'fr': path.join(this.projectRoot, 'content/fr/queue')
      };
      this.blogDirs = {
        'en': path.join(this.projectRoot, 'content/en/blog'),
        'fr': path.join(this.projectRoot, 'content/fr/blog')
      };
      this.draftsDirs = {
        'en': path.join(this.projectRoot, 'content/en/drafts'),
        'fr': path.join(this.projectRoot, 'content/fr/drafts')
      };
    } else {
      console.log('📁 Using legacy structure');
      this.locales = ['en']; // Default to English only for legacy
      this.queueDirs = {
        'en': path.join(this.projectRoot, 'content/queue')
      };
      this.blogDirs = {
        'en': path.join(this.projectRoot, 'content/blog')
      };
      this.draftsDirs = {
        'en': path.join(this.projectRoot, 'content/drafts')
      };
    }

    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    for (const locale of this.locales) {
      [this.queueDirs[locale], this.blogDirs[locale], this.draftsDirs[locale]].forEach(dir => {
        if (dir && !fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`📁 Created directory: ${dir}`);
        }
      });
    }
  }

  /**
   * Get all articles from a directory with metadata
   */
  getArticlesFromDirectory(directory) {
    if (!directory || !fs.existsSync(directory)) return [];

    const files = fs.readdirSync(directory).filter(file => file.endsWith('.md'));

    return files.map(filename => {
      const filePath = path.join(directory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const stats = fs.statSync(filePath);

      return {
        filename,
        path: filePath,
        data,
        content,
        stats
      };
    });
  }

  /**
   * Get queued articles from all locales (ready to publish)
   */
  getQueuedArticles(locale = null) {
    let allQueued = [];

    const localesToCheck = locale ? [locale] : this.locales;

    for (const loc of localesToCheck) {
      if (this.queueDirs[loc]) {
        const articles = this.getArticlesFromDirectory(this.queueDirs[loc])
          .filter(article => !article.data.scheduledFor)
          .map(article => ({ ...article, locale: loc }));
        allQueued = allQueued.concat(articles);
      }
    }

    return allQueued;
  }

  /**
   * Get scheduled articles from all locales (assigned specific dates)
   */
  getScheduledArticles(locale = null) {
    let allScheduled = [];

    const localesToCheck = locale ? [locale] : this.locales;

    for (const loc of localesToCheck) {
      if (this.queueDirs[loc]) {
        const articles = this.getArticlesFromDirectory(this.queueDirs[loc])
          .filter(article => article.data.scheduledFor)
          .map(article => ({ ...article, locale: loc }));
        allScheduled = allScheduled.concat(articles);
      }
    }

    return allScheduled.sort((a, b) => new Date(a.data.scheduledFor) - new Date(b.data.scheduledFor));
  }

  /**
   * Get published articles from all locales
   */
  getPublishedArticles(locale = null) {
    let allPublished = [];

    const localesToCheck = locale ? [locale] : this.locales;

    for (const loc of localesToCheck) {
      if (this.blogDirs[loc]) {
        const articles = this.getArticlesFromDirectory(this.blogDirs[loc])
          .map(article => ({ ...article, locale: loc }));
        allPublished = allPublished.concat(articles);
      }
    }

    return allPublished.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  }

  /**
   * Get draft articles from all locales
   */
  getDraftArticles(locale = null) {
    let allDrafts = [];

    const localesToCheck = locale ? [locale] : this.locales;

    for (const loc of localesToCheck) {
      if (this.draftsDirs[loc]) {
        const articles = this.getArticlesFromDirectory(this.draftsDirs[loc])
          .map(article => ({ ...article, locale: loc }));
        allDrafts = allDrafts.concat(articles);
      }
    }

    return allDrafts;
  }

  /**
   * Move article from drafts to queue
   */
  moveToQueue(filename, priority = 'normal', locale = 'en') {
    const draftPath = path.join(this.draftsDirs[locale] || this.draftsDirs['en'], filename);
    const queuePath = path.join(this.queueDirs[locale] || this.queueDirs['en'], filename);

    if (!fs.existsSync(draftPath)) {
      throw new Error(`Draft file not found: ${filename} in ${locale} locale`);
    }

    // Read and update metadata
    const fileContents = fs.readFileSync(draftPath, 'utf8');
    const { data, content } = matter(fileContents);

    const updatedData = {
      ...data,
      priority,
      locale: locale, // Ensure locale is set
      queuedAt: new Date().toISOString(),
      publishDate: data.publishDate || 'auto'
    };

    const updatedContent = matter.stringify(content, updatedData);

    // Move file
    fs.writeFileSync(queuePath, updatedContent);
    fs.unlinkSync(draftPath);

    console.log(`📝 Moved to queue: ${filename} (priority: ${priority}, locale: ${locale})`);
    return queuePath;
  }

  /**
   * Schedule article for specific date
   */
  scheduleArticle(filename, publishDate, locale = 'en') {
    const queuePath = path.join(this.queueDirs[locale] || this.queueDirs['en'], filename);

    if (!fs.existsSync(queuePath)) {
      throw new Error(`Queued article not found: ${filename} in ${locale} locale`);
    }

    // Check if date is already taken
    const existingArticle = this.getScheduledArticles()
      .find(article => article.data.scheduledFor === publishDate);

    if (existingArticle) {
      throw new Error(`Date ${publishDate} already has scheduled article: ${existingArticle.filename}`);
    }

    // Update metadata
    const fileContents = fs.readFileSync(queuePath, 'utf8');
    const { data, content } = matter(fileContents);

    const updatedData = {
      ...data,
      locale: locale, // Ensure locale is set
      scheduledFor: publishDate,
      scheduledAt: new Date().toISOString()
    };

    const updatedContent = matter.stringify(content, updatedData);
    fs.writeFileSync(queuePath, updatedContent);

    console.log(`📅 Scheduled: ${filename} for ${publishDate} (locale: ${locale})`);
    return queuePath;
  }

  /**
   * Auto-schedule queued articles
   */
  autoScheduleQueued() {
    const queuedArticles = this.getQueuedArticles();
    const scheduledDates = this.getScheduledArticles()
      .map(article => article.data.scheduledFor);

    let scheduled = 0;

    for (const article of queuedArticles) {
      const nextDate = this.getNextAvailableDate(scheduledDates);
      if (nextDate) {
        this.scheduleArticle(article.filename, nextDate, article.locale);
        scheduledDates.push(nextDate);
        scheduled++;
      }
    }

    console.log(`🗓️  Auto-scheduled ${scheduled} articles`);
    return scheduled;
  }

  /**
   * Get next available publishing date
   */
  getNextAvailableDate(excludeDates = []) {
    const today = new Date();
    let candidate = new Date(today);
    candidate.setDate(candidate.getDate() + 1); // Start from tomorrow

    // Preferred days: Tuesday(2), Wednesday(3), Thursday(4)
    const preferredDays = [2, 3, 4];

    // Look ahead 30 days for preferred days
    for (let i = 0; i < 30; i++) {
      const dateString = candidate.toISOString().split('T')[0];
      const dayOfWeek = candidate.getDay();

      if (preferredDays.includes(dayOfWeek) && !excludeDates.includes(dateString)) {
        return dateString;
      }

      candidate.setDate(candidate.getDate() + 1);
    }

    // Fallback: any available day
    candidate = new Date(today);
    candidate.setDate(candidate.getDate() + 1);

    for (let i = 0; i < 60; i++) {
      const dateString = candidate.toISOString().split('T')[0];

      if (!excludeDates.includes(dateString)) {
        return dateString;
      }

      candidate.setDate(candidate.getDate() + 1);
    }

    return null;
  }

  /**
   * Get queue status and health
   */
  getQueueStatus() {
    const queued = this.getQueuedArticles();
    const scheduled = this.getScheduledArticles();
    const published = this.getPublishedArticles();
    const drafts = this.getDraftArticles();

    const today = new Date().toISOString().split('T')[0];
    const upcomingWeek = scheduled.filter(article => {
      const schedDate = new Date(article.data.scheduledFor);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return schedDate <= weekFromNow;
    });

    return {
      queued: queued.length,
      scheduled: scheduled.length,
      published: published.length,
      drafts: drafts.length,
      upcomingWeek: upcomingWeek.length,
      totalBuffer: queued.length + scheduled.length,
      nextScheduled: scheduled[0]?.data.scheduledFor || 'None',
      warnings: this.getHealthWarnings(queued.length + scheduled.length),
      locales: this.locales,
      structure: fs.existsSync(path.join(this.projectRoot, 'content/en')) ? 'i18n' : 'legacy'
    };
  }

  /**
   * Get health warnings
   */
  getHealthWarnings(totalBuffer) {
    const warnings = [];

    if (totalBuffer < 3) {
      warnings.push('🚨 Critical: Less than 3 articles in pipeline');
    } else if (totalBuffer < 7) {
      warnings.push('⚠️  Warning: Less than one week of content');
    }

    // Check for duplicate slugs across all locales
    const allArticles = [
      ...this.getQueuedArticles(),
      ...this.getScheduledArticles(),
      ...this.getPublishedArticles()
    ];

    const slugs = allArticles.map(a => a.data.slug).filter(Boolean);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

    if (duplicates.length > 0) {
      warnings.push(`🔄 Duplicate slugs: ${[...new Set(duplicates)].join(', ')}`);
    }

    return warnings;
  }

  /**
   * Preview upcoming publishing schedule
   */
  previewSchedule(days = 14) {
    const scheduled = this.getScheduledArticles();
    const today = new Date();

    const preview = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      const article = scheduled.find(a => a.data.scheduledFor === dateString);

      preview.push({
        date: dateString,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        article: article ? {
          title: article.data.title,
          filename: article.filename,
          priority: article.data.priority || 'normal',
          locale: article.locale || 'en'
        } : null
      });
    }

    return preview;
  }
}

module.exports = QueueManager;
