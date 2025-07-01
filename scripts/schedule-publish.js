// Content Scheduling System - Core Logic Design
// File: scripts/schedule-publish.js

/**
 * STRATEGIC DESIGN OVERVIEW
 * 
 * 1. CONTENT STATES:
 *    - QUEUED: Ready to publish, waiting for slot
 *    - SCHEDULED: Assigned specific publish date
 *    - PUBLISHED: Live on blog
 * 
 * 2. SCHEDULING STRATEGY:
 *    - Check daily at 9 AM if today has content to publish
 *    - Move one article from queue → blog
 *    - Regenerate blog data & sitemap
 *    - Trigger your existing deployment
 * 
 * 3. QUEUE MANAGEMENT:
 *    - Smart date assignment based on preferences
 *    - Priority handling for urgent content
 *    - Buffer management to maintain consistency
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

class ContentScheduler {
  constructor(config) {
    this.config = config;
    this.queueDir = path.join(process.cwd(), 'content/queue');
    this.blogDir = path.join(process.cwd(), 'content/blog');
    this.today = new Date().toISOString().split('T')[0];
  }

  /**
   * MAIN STRATEGY: Check if we should publish today
   */
  async shouldPublishToday() {
    const publishingRules = this.config.publishing;
    
    // Check if today is a publishing day
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (publishingRules.skipWeekends && isWeekend) {
      this.log('📅 Skipping weekend - no publishing today');
      return false;
    }
    
    // Check if we already published today
    const todaysPosts = this.getPostsPublishedToday();
    if (todaysPosts.length > 0) {
      this.log('✅ Already published today:', todaysPosts[0].title);
      return false;
    }
    
    // Check if there's content scheduled for today
    const scheduledArticle = this.getArticleScheduledFor(this.today);
    if (scheduledArticle) {
      this.log('📝 Found article scheduled for today:', scheduledArticle.title);
      return true;
    }
    
    // Auto-schedule next article if queue has content
    const nextArticle = this.getNextQueuedArticle();
    if (nextArticle) {
      this.log('🎯 Auto-scheduling next article for today:', nextArticle.title);
      return true;
    }
    
    this.log('📭 No content available for publishing today');
    return false;
  }

  /**
   * PUBLISHING STRATEGY: Move article from queue to live blog
   */
  async publishTodaysArticle() {
    try {
      // Get the article to publish
      let article = this.getArticleScheduledFor(this.today);
      
      if (!article) {
        article = this.getNextQueuedArticle();
        if (!article) {
          throw new Error('No article available to publish');
        }
      }
      
      this.log('🚀 Publishing article:', article.title);
      
      // Update article metadata with publish date
      const updatedContent = this.updateArticleForPublication(article);
      
      // Move file from queue to blog
      const queuePath = path.join(this.queueDir, article.filename);
      const blogPath = path.join(this.blogDir, article.filename);
      
      fs.writeFileSync(blogPath, updatedContent);
      fs.unlinkSync(queuePath);
      
      this.log('✅ Article published successfully');
      
      // Return article info for further processing
      return {
        title: article.title,
        slug: article.slug,
        filename: article.filename
      };
      
    } catch (error) {
      this.log('❌ Publishing failed:', error.message);
      throw error;
    }
  }

  /**
   * QUEUE MANAGEMENT STRATEGY
   */
  getNextQueuedArticle() {
    const queuedArticles = this.getQueuedArticles();
    
    if (queuedArticles.length === 0) return null;
    
    // Sort by priority, then by date added
    queuedArticles.sort((a, b) => {
      // High priority first
      if (a.data.priority === 'high' && b.data.priority !== 'high') return -1;
      if (b.data.priority === 'high' && a.data.priority !== 'high') return 1;
      
      // Then by date added (FIFO)
      return new Date(a.stats.birthtime) - new Date(b.stats.birthtime);
    });
    
    return queuedArticles[0];
  }

  /**
   * SMART DATE ASSIGNMENT STRATEGY
   */
  getNextAvailablePublishDate(preferredDays = [2, 3, 4]) { // Tue, Wed, Thu
    const today = new Date();
    let candidate = new Date(today);
    candidate.setDate(candidate.getDate() + 1); // Start from tomorrow
    
    // Find next preferred day that doesn't have content
    for (let i = 0; i < 30; i++) { // Look ahead 30 days max
      const dayOfWeek = candidate.getDay();
      const dateString = candidate.toISOString().split('T')[0];
      
      // Check if this day is preferred and available
      if (preferredDays.includes(dayOfWeek)) {
        const existingArticle = this.getArticleScheduledFor(dateString);
        if (!existingArticle) {
          return dateString;
        }
      }
      
      candidate.setDate(candidate.getDate() + 1);
    }
    
    // Fallback: just find any available day
    candidate = new Date(today);
    candidate.setDate(candidate.getDate() + 1);
    
    for (let i = 0; i < 60; i++) { // Look ahead 60 days max
      const dateString = candidate.toISOString().split('T')[0];
      const existingArticle = this.getArticleScheduledFor(dateString);
      
      if (!existingArticle) {
        return dateString;
      }
      
      candidate.setDate(candidate.getDate() + 1);
    }
    
    return null; // No available dates found
  }

  /**
   * BUFFER MANAGEMENT STRATEGY
   */
  checkQueueHealth() {
    const queuedArticles = this.getQueuedArticles();
    const scheduledArticles = this.getScheduledArticles();
    
    const status = {
      queueCount: queuedArticles.length,
      scheduledCount: scheduledArticles.length,
      totalBuffer: queuedArticles.length + scheduledArticles.length,
      daysOfContent: this.calculateDaysOfContent(),
      warnings: []
    };
    
    // Buffer warnings
    if (status.totalBuffer < 5) {
      status.warnings.push('⚠️  Low content buffer - consider adding more articles');
    }
    
    if (status.daysOfContent < 7) {
      status.warnings.push('🚨 Less than one week of content remaining');
    }
    
    // Queue quality checks
    const duplicateSlugs = this.findDuplicateSlugs();
    if (duplicateSlugs.length > 0) {
      status.warnings.push(`🔄 Duplicate slugs found: ${duplicateSlugs.join(', ')}`);
    }
    
    return status;
  }

  /**
   * UTILITY METHODS
   */
  getQueuedArticles() {
    return this.getArticlesFromDirectory(this.queueDir)
      .filter(article => !article.data.scheduledFor);
  }

  getScheduledArticles() {
    return this.getArticlesFromDirectory(this.queueDir)
      .filter(article => article.data.scheduledFor);
  }

  getArticleScheduledFor(date) {
    return this.getScheduledArticles()
      .find(article => article.data.scheduledFor === date);
  }

  getPostsPublishedToday() {
    return this.getArticlesFromDirectory(this.blogDir)
      .filter(article => article.data.date === this.today);
  }

  updateArticleForPublication(article) {
    const updatedData = {
      ...article.data,
      date: this.today,
      scheduledFor: undefined // Remove scheduling metadata
    };
    
    return matter.stringify(article.content, updatedData);
  }

  log(message, ...args) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${message}`, ...args);
  }
}

/**
 * CRON JOB INTEGRATION STRATEGY
 * 
 * Daily Cron Job (9 AM):
 * 1. Check if we should publish today
 * 2. If yes, publish one article
 * 3. Regenerate blog data & sitemap
 * 4. Trigger your existing deployment script
 * 5. Send notifications
 * 
 * Weekly Cron Job (Sunday):
 * 1. Check queue health
 * 2. Auto-schedule queued articles
 * 3. Generate weekly report
 * 4. Send buffer warnings if needed
 */

module.exports = ContentScheduler;
