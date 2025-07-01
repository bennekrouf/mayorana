// Queue Management Utilities
// File: scripts/queue-manager.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class QueueManager {
  constructor() {
    this.queueDir = path.join(process.cwd(), 'content/queue');
    this.blogDir = path.join(process.cwd(), 'content/blog');
    this.draftsDir = path.join(process.cwd(), 'content/drafts');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.queueDir, this.blogDir, this.draftsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  /**
   * Get all articles from a directory with metadata
   */
  getArticlesFromDirectory(directory) {
    if (!fs.existsSync(directory)) return [];
    
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
   * Get queued articles (ready to publish)
   */
  getQueuedArticles() {
    return this.getArticlesFromDirectory(this.queueDir)
      .filter(article => !article.data.scheduledFor);
  }

  /**
   * Get scheduled articles (assigned specific dates)
   */
  getScheduledArticles() {
    return this.getArticlesFromDirectory(this.queueDir)
      .filter(article => article.data.scheduledFor)
      .sort((a, b) => new Date(a.data.scheduledFor) - new Date(b.data.scheduledFor));
  }

  /**
   * Get published articles
   */
  getPublishedArticles() {
    return this.getArticlesFromDirectory(this.blogDir)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  }

  /**
   * Get draft articles
   */
  getDraftArticles() {
    return this.getArticlesFromDirectory(this.draftsDir);
  }

  /**
   * Move article from drafts to queue
   */
  moveToQueue(filename, priority = 'normal') {
    const draftPath = path.join(this.draftsDir, filename);
    const queuePath = path.join(this.queueDir, filename);
    
    if (!fs.existsSync(draftPath)) {
      throw new Error(`Draft file not found: ${filename}`);
    }

    // Read and update metadata
    const fileContents = fs.readFileSync(draftPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const updatedData = {
      ...data,
      priority,
      queuedAt: new Date().toISOString(),
      publishDate: data.publishDate || 'auto'
    };
    
    const updatedContent = matter.stringify(content, updatedData);
    
    // Move file
    fs.writeFileSync(queuePath, updatedContent);
    fs.unlinkSync(draftPath);
    
    console.log(`📝 Moved to queue: ${filename} (priority: ${priority})`);
    return queuePath;
  }

  /**
   * Schedule article for specific date
   */
  scheduleArticle(filename, publishDate) {
    const queuePath = path.join(this.queueDir, filename);
    
    if (!fs.existsSync(queuePath)) {
      throw new Error(`Queued article not found: ${filename}`);
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
      scheduledFor: publishDate,
      scheduledAt: new Date().toISOString()
    };
    
    const updatedContent = matter.stringify(content, updatedData);
    fs.writeFileSync(queuePath, updatedContent);
    
    console.log(`📅 Scheduled: ${filename} for ${publishDate}`);
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
        this.scheduleArticle(article.filename, nextDate);
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
      warnings: this.getHealthWarnings(queued.length + scheduled.length)
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
    
    // Check for duplicate slugs
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
          priority: article.data.priority || 'normal'
        } : null
      });
    }
    
    return preview;
  }
}

module.exports = QueueManager;
