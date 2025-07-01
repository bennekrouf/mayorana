// Content Validator
// File: scripts/content-validator.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class ContentValidator {
  constructor() {
    this.requiredFields = [
      'title',
      'slug', 
      'author',
      'excerpt',
      'tags'
    ];
    
    this.optionalFields = [
      'id',
      'date',
      'category',
      'image',
      'priority',
      'publishDate',
      'scheduledFor'
    ];
  }

  /**
   * Validate a single article file
   */
  validateArticle(filePath) {
    const errors = [];
    const warnings = [];
    
    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        errors.push('File does not exist');
        return { valid: false, errors, warnings };
      }

      // Read and parse frontmatter
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Validate required fields
      for (const field of this.requiredFields) {
        if (!data[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }
      
      // Validate field formats
      this.validateFieldFormats(data, errors, warnings);
      
      // Validate content
      this.validateContent(content, errors, warnings);
      
      // Validate slug uniqueness (if in queue/blog)
      this.validateSlugUniqueness(data.slug, filePath, errors);
      
    } catch (error) {
      errors.push(`Failed to parse file: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate field formats
   */
  validateFieldFormats(data, errors, warnings) {
    // Title validation
    if (data.title && data.title.length > 100) {
      warnings.push('Title is very long (>100 chars) - may affect SEO');
    }
    
    // Slug validation
    if (data.slug) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(data.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }
      
      if (data.slug.length > 60) {
        warnings.push('Slug is very long (>60 chars) - may affect URLs');
      }
    }
    
    // Excerpt validation
    if (data.excerpt && data.excerpt.length > 200) {
      warnings.push('Excerpt is long (>200 chars) - consider shortening for better display');
    }
    
    // Tags validation
    if (data.tags) {
      if (!Array.isArray(data.tags)) {
        errors.push('Tags must be an array');
      } else {
        if (data.tags.length === 0) {
          warnings.push('No tags specified - consider adding for better categorization');
        }
        
        if (data.tags.length > 10) {
          warnings.push('Many tags (>10) - consider reducing for focus');
        }
        
        // Check tag format
        data.tags.forEach(tag => {
          if (typeof tag !== 'string') {
            errors.push('All tags must be strings');
          }
        });
      }
    }
    
    // Date validation
    if (data.date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(data.date)) {
        errors.push('Date must be in YYYY-MM-DD format');
      } else {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
          errors.push('Date is not a valid date');
        }
      }
    }
    
    // Priority validation
    if (data.priority && !['high', 'normal', 'low'].includes(data.priority)) {
      errors.push('Priority must be "high", "normal", or "low"');
    }
    
    // Scheduled date validation
    if (data.scheduledFor) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(data.scheduledFor)) {
        errors.push('scheduledFor must be in YYYY-MM-DD format');
      } else {
        const schedDate = new Date(data.scheduledFor);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (schedDate < today) {
          warnings.push('Scheduled date is in the past');
        }
      }
    }
  }

  /**
   * Validate content
   */
  validateContent(content, errors, warnings) {
    const trimmedContent = content.trim();
    
    // Check content exists
    if (!trimmedContent) {
      errors.push('Article has no content');
      return;
    }
    
    // Content length warnings
    if (trimmedContent.length < 500) {
      warnings.push('Content is quite short (<500 chars) - consider expanding');
    }
    
    if (trimmedContent.length > 20000) {
      warnings.push('Content is very long (>20k chars) - consider breaking into parts');
    }
    
    // Check for common markdown issues
    const lines = content.split('\n');
    
    // Check for duplicate H1s (title duplication)
    const h1Count = (content.match(/^#\s+/gm) || []).length;
    if (h1Count > 1) {
      warnings.push('Multiple H1 headings found - may cause title duplication');
    }
    
    // Check for missing alt text in images
    const imagePattern = /!\[([^\]]*)\]\([^)]+\)/g;
    const images = content.match(imagePattern) || [];
    images.forEach((img, index) => {
      if (img.startsWith('![]')) {
        warnings.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    // Check for long lines (readability)
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > lines.length * 0.1) {
      warnings.push('Many long lines detected - consider breaking for readability');
    }
  }

  /**
   * Validate slug uniqueness
   */
  validateSlugUniqueness(slug, currentFilePath, errors) {
    if (!slug) return;
    
    const contentDirs = [
      path.join(process.cwd(), 'content/queue'),
      path.join(process.cwd(), 'content/blog')
    ];
    
    for (const dir of contentDirs) {
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        // Skip the current file
        if (filePath === currentFilePath) continue;
        
        try {
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(fileContents);
          
          if (data.slug === slug) {
            errors.push(`Slug "${slug}" already exists in ${path.relative(process.cwd(), filePath)}`);
          }
        } catch (error) {
          // Skip files that can't be parsed
        }
      }
    }
  }

  /**
   * Validate all articles in a directory
   */
  validateDirectory(directory) {
    const results = [];
    
    if (!fs.existsSync(directory)) {
      return {
        directory,
        valid: false,
        error: 'Directory does not exist',
        results: []
      };
    }
    
    const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const validation = this.validateArticle(filePath);
      
      results.push({
        file,
        path: filePath,
        ...validation
      });
    }
    
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    return {
      directory,
      valid: totalErrors === 0,
      totalFiles: files.length,
      totalErrors,
      totalWarnings,
      results
    };
  }

  /**
   * Validate all content directories
   */
  validateAllContent() {
    const directories = [
      path.join(process.cwd(), 'content/drafts'),
      path.join(process.cwd(), 'content/queue'),
      path.join(process.cwd(), 'content/blog')
    ];
    
    const results = {};
    
    for (const dir of directories) {
      const dirName = path.basename(dir);
      results[dirName] = this.validateDirectory(dir);
    }
    
    return results;
  }

  /**
   * Generate validation report
   */
  generateReport(validationResults) {
    let report = '\n📋 Content Validation Report\n';
    report += '=' + '='.repeat(50) + '\n\n';
    
    for (const [dirName, result] of Object.entries(validationResults)) {
      const status = result.valid ? '✅' : '❌';
      report += `${status} ${dirName.toUpperCase()}\n`;
      
      if (!result.valid && result.error) {
        report += `   Error: ${result.error}\n\n`;
        continue;
      }
      
      report += `   Files: ${result.totalFiles}\n`;
      report += `   Errors: ${result.totalErrors}\n`;
      report += `   Warnings: ${result.totalWarnings}\n`;
      
      // Show individual file issues
      const problemFiles = result.results.filter(r => !r.valid || r.warnings.length > 0);
      
      if (problemFiles.length > 0) {
        report += '\n   Issues:\n';
        
        for (const file of problemFiles) {
          if (file.errors.length > 0) {
            report += `   ❌ ${file.file}:\n`;
            file.errors.forEach(error => {
              report += `      • ${error}\n`;
            });
          }
          
          if (file.warnings.length > 0) {
            report += `   ⚠️  ${file.file}:\n`;
            file.warnings.forEach(warning => {
              report += `      • ${warning}\n`;
            });
          }
        }
      }
      
      report += '\n';
    }
    
    return report;
  }
}

module.exports = ContentValidator;
