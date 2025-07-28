This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: content, src/data
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    build.yml
config/
  publishing.yaml
  site.yaml
messages/
  en.json
  fr.json
public/
  file.svg
  globe.svg
  robots.txt
  site.webmanifest
  window.svg
scripts/
  blog-cli.js
  content-validator.js
  daily-publish.sh
  deploy-fix.sh
  generate-blog-data.js
  generate-sitemap.js
  queue-manager.js
  schedule-publish.js
src/
  app/
    [locale]/
      about/
        layout.tsx
        page.tsx
      blog/
        [slug]/
          layout.tsx
          page.tsx
        tag/
          [slug]/
            layout.tsx
            page.tsx
        layout.tsx
        page.tsx
      contact/
        layout.tsx
        page.tsx
      services/
        layout.tsx
        page.tsx
      layout.tsx
      not-found.tsx
      page.tsx
    globals.css
    layout.tsx
    page.tsx
    providers.tsx
  components/
    blog/
      BlogList.tsx
      BlogPost.tsx
      Pagination.tsx
      TagFilter.tsx
    home/
      ClientHomeSection.tsx
    layout/
      Footer.tsx
      Layout.tsx
      LayoutTemplate.tsx
      Navbar.tsx
    seo/
      CanonicalMeta.tsx
    ui/
      Motion.tsx
      WhatsAppButton.tsx
    ThemeProvider.tsx
  lib/
    blog.ts
    config.ts
    route-types.ts
  types/
    globals.d.ts
.eslintrc.js
.gitignore
config.yaml
ecosystem.config.js
eslint.config.mjs
i18n.ts
next.config.ts
package.json
postcss.config.mjs
README.md
tailwind.config.ts
tsconfig.json
```

# Files

## File: .github/workflows/build.yml
````yaml
# File: .github/workflows/build.yml
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn build
````

## File: config/publishing.yaml
````yaml
# Publishing Configuration
# File: config/publishing.yaml

# Publishing schedule settings
publishing:
  # Daily publishing time (24-hour format)
  publishTime: "09:00"
  
  # Time zone for publishing
  timezone: "Europe/Zurich"
  
  # Skip publishing on weekends
  skipWeekends: true
  
  # Preferred publishing days (0=Sunday, 1=Monday, etc.)
  preferredDays: [2, 3, 4]  # Tuesday, Wednesday, Thursday
  
  # Maximum articles per day
  maxPerDay: 1
  
  # Minimum buffer (articles in queue + scheduled)
  minBuffer: 5
  
  # Holiday dates to skip (YYYY-MM-DD format)
  skipDates:
    - "2025-12-25"  # Christmas
    - "2025-01-01"  # New Year
    - "2025-07-04"  # July 4th (if relevant)
  
# Content validation rules
validation:
  # Required frontmatter fields
  requiredFields:
    - "title"
    - "slug"
    - "author"
    - "excerpt"
    - "tags"
  
  # Content length limits
  content:
    minLength: 300      # Minimum characters
    maxLength: 50000    # Maximum characters
    warnShort: 500      # Warn if shorter than this
    warnLong: 20000     # Warn if longer than this
  
  # Title and slug limits
  title:
    maxLength: 100
    warnLength: 80
  
  slug:
    maxLength: 60
    warnLength: 50
    pattern: "^[a-z0-9-]+$"
  
  # Tag limits
  tags:
    maxCount: 10
    warnCount: 8
    minCount: 1

# Queue management
queue:
  # Auto-scheduling preferences
  autoSchedule: true
  
  # Priority levels
  priorities:
    - "high"    # Jump to front of queue
    - "normal"  # Standard queue order
    - "low"     # Back of queue
  
  # Default priority for new articles
  defaultPriority: "normal"
  
  # How far ahead to schedule (days)
  scheduleAheadDays: 30
  
  # Buffer warnings
  warnings:
    lowBuffer: 5     # Warn when buffer < 5
    criticalBuffer: 3 # Critical when buffer < 3

# Notification settings
notifications:
  # Slack webhook for alerts (set via environment variable)
  slack:
    enabled: true
    webhook: "${SLACK_WEBHOOK_URL}"
    channel: "#blog-automation"
  
  # Email notifications (optional)
  email:
    enabled: false
    smtp:
      host: "smtp.gmail.com"
      port: 587
      secure: false
      user: "${EMAIL_USER}"
      pass: "${EMAIL_PASS}"
    to: "your-email@example.com"
    from: "blog-bot@mayorana.ch"

# SEO optimization
seo:
  # Automatically ping search engines after publish
  pingSearchEngines: true
  
  # Search engines to notify
  searchEngines:
    google: "https://www.google.com/ping?sitemap=https://mayorana.ch/sitemap.xml"
    bing: "https://www.bing.com/ping?sitemap=https://mayorana.ch/sitemap.xml"
  
  # Generate social media preview images
  generatePreviews: false
  
  # Sitemap settings
  sitemap:
    autoRegenerate: true
    baseUrl: "https://mayorana.ch"

# Logging configuration
logging:
  # Log level (trace, debug, info, warn, error)
  level: "info"
  
  # Log file location
  file: "/var/log/blog-publishing.log"
  
  # Rotate logs
  rotate: true
  maxFiles: 7
  maxSize: "10MB"

# Backup settings
backup:
  # Create backups before publishing
  enabled: true
  
  # Backup location
  directory: "/backups/blog-content"
  
  # Keep backups for (days)
  retentionDays: 30
  
  # What to backup
  include:
    - "content/"
    - "src/data/"
    - "public/sitemap.xml"

# Development settings
development:
  # Skip actual publishing (dry run mode)
  dryRun: false
  
  # Verbose logging
  verbose: false
  
  # Mock external services (search engine pings, etc.)
  mockServices: false
````

## File: messages/en.json
````json
{
  "metadata": {
    "site_title": "Mayorana - Rust, AI, and API Solutions",
    "site_description": "Empowering Innovation with Rust, AI, and API Solutions",
    "about_title": "About",
    "about_description": "Learn about Mayorana and specialized services in Rust, AI agents, and API solutions.",
    "blog_title": "Blog - Mayorana",
    "blog_description": "Insights and articles about Rust, AI, and modern software development.",
    "contact_title": "Contact",
    "contact_description": "Get in touch for Rust training, LLM integration, AI agent development, and api0.ai solutions.",
    "services_title": "Services",
    "services_description": "Expert services in Rust training, LLM integration, AI agent development, and api0.ai solutions."
  },
  "navigation": {
    "home": "Home",
    "services": "Services",
    "blog": "Blog", 
    "about": "About",
    "contact": "Contact",
    "get_started": "Get Started",
    "toggle_theme": "Toggle Theme",
    "toggle_menu": "Toggle Menu"
  },
  "home": {
    "hero_title": "Building Smarter Solutions with Rust, AI, and APIs",
    "hero_subtitle": "Specialized in Rust training, LLM integration, and AI agent development for businesses across Switzerland and beyond.",
    "discover_api0": "Discover api0.ai",
    "book_rust_training": "Book a Rust Training",
    "what_i_offer": "What I Offer",
    "services_subtitle": "Specialized services that help businesses innovate and transform through modern technology solutions.",
    "latest_insights": "Latest Insights",
    "insights_subtitle": "Thoughts and tutorials on Rust, LLM integration, and AI agent development.",
    "view_all_articles": "View All Articles",
    "discover_api0_title": "Discover api0.ai",
    "api0_description": "api0.ai is my flagship solution for enterprises looking to streamline API integrations. Using advanced NLP, it intelligently matches user sentences to the right API endpoints, reducing development time and complexity.",
    "api0_feature1": "Minimal setup with JavaScript SDK",
    "api0_feature2": "Secure API key management", 
    "api0_feature3": "Scalable for enterprise needs",
    "explore_api0": "Explore api0.ai",
    "my_work": "My Work",
    "work_subtitle": "Showcasing successful projects and collaborations across Switzerland and beyond.",
    "contact_custom_solutions": "Contact Me for Custom Solutions",
    "what_clients_say": "What Clients Say",
    "testimonials_subtitle": "The experiences of those who have benefited from my services.",
    "ready_elevate": "Ready to Elevate Your Tech Stack?",
    "cta_description": "Contact me for Rust training, LLM integration, or custom solutions that drive innovation and efficiency.",
    "get_in_touch": "Get in Touch"
  },
  "services": {
    "rust_training": {
      "title": "Rust Training",
      "description": "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization. Tailored courses for beginners to advanced developers, with real-world applications in fintech, systems programming, and more.",
      "cta": "Schedule a Training Session",
      "benefit1": "Master Rust's ownership system and memory safety features",
      "benefit2": "Learn concurrent programming patterns with Rust's guarantees", 
      "benefit3": "Understand performance optimization techniques",
      "benefit4": "Apply Rust to real-world problems in your domain"
    },
    "llm_integration": {
      "title": "LLM Integration",
      "description": "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing. Custom solutions designed to integrate with your existing systems, ensuring scalability and performance.",
      "cta": "Get a Free Consultation",
      "benefit1": "Integrate leading LLMs into your existing products",
      "benefit2": "Build custom knowledge bases for domain-specific applications",
      "benefit3": "Implement scalable prompt engineering frameworks",
      "benefit4": "Create robust evaluation systems for LLM outputs"
    },
    "ai_agent": {
      "title": "AI Agent Development", 
      "description": "Build intelligent AI agents for automation, decision-making, and process optimization. From concept to deployment, I create agents that leverage NLP and gRPC for enterprise-grade performance.",
      "cta": "Start Your Agent Project",
      "benefit1": "Automate complex workflows with intelligent agents",
      "benefit2": "Create agents that can reason about your domain",
      "benefit3": "Connect to multiple data sources and APIs",
      "benefit4": "Build self-improving systems with feedback loops"
    },
    "api0": {
      "title": "api0.ai Solutions",
      "description": "Promote api0.ai, my cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations for enterprises. Easy-to-use, secure, and designed for minimal setup.",
      "cta": "Try api0.ai Now",
      "benefit1": "Match natural language inputs to the right API endpoints",
      "benefit2": "Reduce integration time and complexity",
      "benefit3": "Secure API key management with domain restrictions", 
      "benefit4": "Scale seamlessly for enterprise-level traffic"
    },
    "key_benefits": "Key Benefits",
    "ready_get_started": "Ready to Get Started?",
    "contact_description": "Contact me to discuss your specific needs and how my services can help your business innovate and grow."
  },
  "about": {
    "hero_title": "About Me",
    "hero_subtitle": "Bringing expertise in Rust, AI agents, and API solutions to clients worldwide",
    "who_i_am": "Who I Am",
    "description1": "As a solopreneur based in Switzerland, I specialize in delivering cutting-edge solutions in Rust programming, AI agent development, and seamless LLM integrations.",
    "description2": "With a passion for simplifying complex systems, I empower businesses through tailored Rust training and innovative tools like api0.ai, my NLP-driven API-matching solution.",
    "description3": "My work blends technical expertise with a commitment to driving efficiency and innovation for enterprises worldwide.",
    "description4": "Proudly operating from the heart of Switzerland, I bring precision and reliability to every project.",
    "skills_expertise": "Skills & Expertise",
    "programming": "Programming",
    "ai_ml": "AI & ML",
    "infrastructure": "Infrastructure", 
    "frontend": "Frontend",
    "core_values": "Core Values",
    "technical_excellence": {
      "title": "Technical Excellence",
      "description": "Building robust, performant, and maintainable systems that stand the test of time."
    },
    "continuous_learning": {
      "title": "Continuous Learning", 
      "description": "Staying at the forefront of technology to deliver cutting-edge solutions."
    },
    "client_success": {
      "title": "Client Success",
      "description": "Focusing on outcomes that drive real business value and innovation."
    },
    "simplicity": {
      "title": "Simplicity",
      "description": "Creating elegant solutions that reduce complexity and are easy to understand."
    },
    "featured_project": "Featured Project: api0.ai",
    "project_subtitle": "My flagship innovation, streamlining API integrations through advanced NLP",
    "project_description1": "api0.ai represents the culmination of my work in AI and API integration, providing a solution that intelligently matches natural language inputs to the right API endpoints.",
    "project_description2": "Using advanced natural language processing, api0.ai simplifies the integration process for businesses, reducing development time and complexity while providing robust security features.",
    "visit_api0": "Visit api0.ai",
    "ready_work_together": "Ready to Work Together?",
    "cta_description": "Let's discuss how my expertise can help your business achieve its goals with innovative technology solutions."
  },
  "contact": {
    "hero_title": "Get in Touch",
    "hero_subtitle": "Ready to elevate your tech stack with Rust, AI, or api0.ai? Let's discuss how I can help your business succeed.",
    "faster_response": "For a faster response on mobile:",
    "contact_via_whatsapp": "Contact via WhatsApp",
    "contact_information": "Contact Information",
    "location_description": "Based in Switzerland, I'm here to help global and local clients succeed with cutting-edge solutions.",
    "email": "Email",
    "location": "Location",
    "linkedin": "LinkedIn",
    "response_time": "Response Time",
    "response_description": "I typically respond to inquiries within 24 hours during business days.",
    "send_message": "Send a Message",
    "name": "Name",
    "company_optional": "Company (Optional)",
    "service_interest": "Service of Interest",
    "select_service": "Select a service",
    "message": "Message",
    "message_placeholder": "How can I help you?",
    "sending": "Sending...",
    "send_message_button": "Send Message",
    "message_sent_title": "Message Sent Successfully!",
    "message_sent_description": "Thank you for reaching out. I'll get back to you as soon as possible.",
    "send_another": "Send Another Message",
    "required_field": "Required field",
    "name_required": "Name is required",
    "email_required": "Email is required", 
    "invalid_email": "Invalid email address",
    "service_required": "Please select a service",
    "message_required": "Message is required"
  },
  "blog": {
    "hero_title": "Blog",
    "hero_subtitle": "Insights and articles about Rust, AI, and modern software development.",
    "filter_by_topic": "Filter by Topic",
    "all": "All",
    "no_posts": "No posts found",
    "read_more": "Read More",
    "back_to_blog": "Back to Blog",
    "share": "Share:",
    "share_twitter": "Share on X (Twitter)",
    "share_linkedin": "Share on LinkedIn", 
    "copy_link": "Copy link",
    "link_copied": "Link copied!",
    "table_contents": "Table of Contents",
    "tags": "Tags",
    "previous": "Previous",
    "next": "Next",
    "article": "Article",
    "articles_about": "articles about"
  },
  "footer": {
    "description": "Specialized in Rust, LLM integration, and AI agent development. Based in Switzerland, serving clients worldwide.",
    "quick_links": "Quick Links",
    "services": "Services",
    "connect": "Connect",
    "email_label": "Email:",
    "copyright": "All rights reserved.",
    "tagline": "Based in Switzerland, Serving the World"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "page_not_found": "Page Not Found",
    "not_found_description": "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
    "return_home": "Return to Home",
    "switzerland": "Switzerland"
  },
  "portfolio": {
    "rust_training_java": {
      "title": "Rust Training for Java Developers",
      "description": "Delivering hands-on Rust training programs tailored for Java developers, enabling them to master Rust with the same fluency as Java.",
      "category": "Training"
    },
    "llm_chatbot": {
      "title": "LLM-Powered Chatbot", 
      "description": "Integrated an LLM into a client's customer service platform, reducing response times by 40%.",
      "category": "Integration"
    },
    "api0_implementation": {
      "title": "api0.ai Implementation",
      "description": "Helped an e-commerce client map user queries to product APIs, cutting integration time by 50%.",
      "category": "Development"
    }
  },
  "testimonials": {
    "fintech_lead": {
      "quote": "The Rust training was transformative for our team. Clear, practical, and perfectly tailored to our needs.",
      "author": "Fintech Lead, Zurich"
    },
    "ecommerce_cto": {
      "quote": "api0.ai made our API integrations effortless. It's a game-changer for our platform.",
      "author": "E-commerce CTO"
    }
  }
}
````

## File: public/file.svg
````
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/robots.txt
````
# robots.txt for api0.ai
User-agent: *
Allow: /

# Allow all bots to access the site
# Specify sitemap location
Sitemap: https://mayorana.ch/sitemap.xml

# Prevent bots from crawling dev/staging areas if they exist
User-agent: *
Disallow: /admin/
Disallow: /dev/
Disallow: /staging/
````

## File: public/site.webmanifest
````
{"name":"","short_name":"","icons":[{"src":"/android-chrome-192x192.png","sizes":"192x192","type":"image/png"},{"src":"/android-chrome-512x512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#ffffff","background_color":"#ffffff","display":"standalone"}
````

## File: public/window.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: scripts/blog-cli.js
````javascript
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
````

## File: scripts/content-validator.js
````javascript
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
````

## File: scripts/deploy-fix.sh
````bash
#!/bin/bash
# Deployment Fix Script - Ensures blog data and sitemap are generated
# File: scripts/deploy-fix.sh

set -e

echo "🚀 Starting deployment fix..."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Not in project root directory"
  exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p src/data
mkdir -p public
mkdir -p content/{blog,queue,drafts}

# Generate blog data first
echo "📊 Generating blog data..."
if [ -f "scripts/generate-blog-data.js" ]; then
  node scripts/generate-blog-data.js
  echo "✅ Blog data generated"
else
  echo "⚠️  Blog data generator not found, creating minimal data..."
  echo "[]" >src/data/blog-posts.json
  echo "[]" >src/data/blog-categories.json
fi

# Generate sitemap
echo "🗺️  Generating sitemap..."
if [ -f "scripts/generate-sitemap.js" ]; then
  node scripts/generate-sitemap.js
  echo "✅ Sitemap generated"
else
  echo "❌ Sitemap generator not found"
  exit 1
fi

# Verify files were created
echo "🔍 Verifying generated files..."

if [ -f "src/data/blog-posts.json" ]; then
  POSTS_COUNT=$(cat src/data/blog-posts.json | jq length 2>/dev/null || echo "unknown")
  echo "✅ Blog posts JSON exists (${POSTS_COUNT} posts)"
else
  echo "❌ Blog posts JSON missing"
  exit 1
fi

if [ -f "public/sitemap.xml" ]; then
  URLS_COUNT=$(grep -c "<url>" public/sitemap.xml || echo "unknown")
  echo "✅ Sitemap exists (${URLS_COUNT} URLs)"
else
  echo "❌ Sitemap missing"
  exit 1
fi

echo "✅ Deployment fix completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Blog posts: ${POSTS_COUNT}"
echo "   - Sitemap URLs: ${URLS_COUNT}"
echo "   - Ready for deployment"
````

## File: scripts/queue-manager.js
````javascript
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
````

## File: src/app/[locale]/about/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Mayorana and specialized services in Rust, AI agents, and API solutions.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/blog/[slug]/layout.tsx
````typescript
import { getPostBySlug } from '@/lib/blog';
import type { Metadata, ResolvingMetadata } from 'next'

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  
  // Get post
  const post = getPostBySlug(slug);
  
  // Use parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  
  if (!post) {
    return {
      title: 'Post Not Found | Mayorana',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.seo?.ogImage 
        ? [{ url: post.seo.ogImage }, ...previousImages]
        : previousImages,
    },
  };
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/blog/[slug]/page.tsx
````typescript
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const posts = getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise in Next.js 15
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const post = getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    return (
      <LayoutTemplate>
        <section className="py-20 bg-background">
          <div className="container">
            <BlogPost post={post} />
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in PostPage:', error);
    notFound();
  }
}
````

## File: src/app/[locale]/contact/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch for Rust training, LLM integration, AI agent development, and api0.ai solutions.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/services/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Expert services in Rust training, LLM integration, AI agent development, and api0.ai solutions.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/not-found.tsx
````typescript
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';

export default function NotFound() {
  return (
    <LayoutTemplate>
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="container text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </LayoutTemplate>
  );
}
````

## File: src/app/providers.tsx
````typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider component to handle light/dark mode for App Router
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
````

## File: src/components/blog/Pagination.tsx
````typescript
// Updated Pagination component without Heroicons dependency
// File: src/components/blog/Pagination.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // "/blog" or "/blog/tag/rust"
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl
}) => {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show 5 page numbers
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Link
          key={1}
          href={getPageUrl(1)}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-3 py-2 text-sm text-muted-foreground">
            ...
          </span>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-primary text-white rounded-lg'
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {i}
        </Link>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-3 py-2 text-sm text-muted-foreground">
            ...
          </span>
        );
      }
      pages.push(
        <Link
          key={totalPages}
          href={getPageUrl(totalPages)}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {totalPages}
        </Link>
      );
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center space-x-1 mt-12">
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Link>
      )}

      {/* Page numbers */}
      <div className="flex items-center space-x-1 mx-4">
        {renderPageNumbers()}
      </div>

      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Next
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </nav>
  );
};

export default Pagination;
````

## File: src/components/layout/LayoutTemplate.tsx
````typescript
'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

interface LayoutTemplateProps {
  children: React.ReactNode;
}

const LayoutTemplate: React.FC<LayoutTemplateProps> = ({
  children
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default LayoutTemplate;
````

## File: src/components/seo/CanonicalMeta.tsx
````typescript
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CanonicalMeta() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Remove existing canonical if any
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();

    // Generate clean canonical URL
    const baseUrl = 'https://mayorana.ch';
    let cleanPath = pathname;

    // Remove trailing slash except for locale roots
    if (cleanPath !== '/en' && cleanPath !== '/fr' && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // Only keep pagination parameters
    const allowedParams = ['page'];
    const relevantParams = new URLSearchParams();
    allowedParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) relevantParams.set(param, value);
    });

    const queryString = relevantParams.toString();
    const canonical = `${baseUrl}${cleanPath}${queryString ? `?${queryString}` : ''}`;

    // Add canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonical;
    document.head.appendChild(link);

    // Add noindex for tracking parameters
    if (searchParams.has('ref') || searchParams.has('from') || searchParams.has('utm_source')) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, follow';
      document.head.appendChild(meta);
    }
  }, [pathname, searchParams]);

  return null;
}
````

## File: src/components/ui/Motion.tsx
````typescript
'use client';

import { motion } from 'framer-motion';

// Re-export motion for client-side use
export { motion };
````

## File: src/components/ThemeProvider.tsx
````typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider component to handle light/dark mode
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
````

## File: src/lib/config.ts
````typescript
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Load configuration from YAML files
 * Based on your preference for using YAML configuration files
 */
// Define a more specific return type instead of any
export function loadConfig(fileName: string): Record<string, unknown> {
  try {
    // Get the absolute path to the config file
    const configPath = path.resolve(process.cwd(), 'config', fileName);
    
    // Read the file synchronously
    const fileContents = fs.readFileSync(configPath, 'utf8');
    
    // Parse the YAML content
    const config = yaml.load(fileContents) as Record<string, unknown>;
    
    // Log the config loading at trace level
    console.trace(`Loaded config from ${fileName}`);
    
    return config;
  } catch (error) {
    console.error(`Error loading config file ${fileName}:`, error);
    return {};
  }
}

// Load site config
export const siteConfig = loadConfig('site.yaml');

// Export specific config sections for easy access
export const colors = siteConfig.colors || {};
export const navigation = siteConfig.navigation || {};
export const services = siteConfig.services || [];
export const portfolio = siteConfig.portfolio || [];
````

## File: src/lib/route-types.ts
````typescript
// Define params types for dynamic routes (Next.js 15)
export type PageParams = Promise<{ slug: string }>;
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Define props interfaces for components
export interface PageProps {
  params: PageParams;
  searchParams?: SearchParams;
}

export interface MetadataProps {
  params: PageParams;
  searchParams?: SearchParams;
}

// More specific types for different route patterns
export type BlogPostParams = Promise<{ slug: string }>;
export type CategoryParams = Promise<{ slug: string }>;

export interface BlogPostProps {
  params: BlogPostParams;
  searchParams?: SearchParams;
}

export interface CategoryProps {
  params: CategoryParams;
  searchParams?: SearchParams;
}
````

## File: .eslintrc.js
````javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Disable the rule for unescaped entities
    'react/no-unescaped-entities': 'off',
  }
};
````

## File: config.yaml
````yaml
# Default configuration for mayorana
service:
  name: mayorana
  version: 1.0.0
````

## File: ecosystem.config.js
````javascript
// PM2 Ecosystem Configuration
// File: ecosystem.config.js
// Smart defaults for mayorana.ch deployment

module.exports = {
  apps: [{
    name: 'mayorana',
    script: 'yarn',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },
    
    // Logging (smart defaults)
    error_file: '/var/log/pm2/mayorana-error.log',
    out_file: '/var/log/pm2/mayorana-out.log',
    log_file: '/var/log/pm2/mayorana-combined.log',
    time: true,
    
    // Auto-restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Optional: Daily restart at 3 AM (after publishing)
    // cron_restart: '0 3 * * *',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Health monitoring
    monitoring: false  // Set to true if you want PM2+ monitoring
  }],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:bennekrouf/mayorana.git',
      path: '/var/www/mayorana',
      
      // Post-deployment commands
      'post-deploy': [
        'yarn install --frozen-lockfile',
        'yarn build',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && ')
    }
  }
};
````

## File: eslint.config.mjs
````
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
````

## File: tailwind.config.ts
````typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary) / 0.8)',
              },
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--primary))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            ul: {
              listStyleType: 'disc',
            },
            li: {
              color: 'hsl(var(--muted-foreground))',
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            p: {
              color: 'hsl(var(--muted-foreground))',
            },
            img: {
              borderRadius: '0.5rem',
            },
            figure: {
              margin: '2rem 0',
            },
            figcaption: {
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginTop: '0.5rem',
            },
            table: {
              fontSize: '0.875rem',
            },
            thead: {
              borderBottomColor: 'hsl(var(--border))',
            },
            'thead th': {
              color: 'hsl(var(--foreground))',
            },
            'tbody tr': {
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody td': {
              padding: '0.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'), // This plugin is essential for Markdown styling
  ],
}

export default config
````

## File: config/site.yaml
````yaml
# Site Configuration
site:
  name: "Mayorana"
  domain: "mayorana.ch"
  description: "Empowering Innovation with Rust, AI, and API Solutions"
  locale: "en"
  logoText: "mayorana"
  
# Color theme based on your provided color palette
colors:
  primary: "#FF6B00"  # Orange from the color palette
  background: 
    light: "#FFFFFF"
    dark: "#0F172A"
  foreground:
    light: "#1E293B"
    dark: "#F8FAFC"
  secondary:
    light: "#F1F5F9"
    dark: "#334155"
  border:
    light: "#E2E8F0"
    dark: "#334155"
  muted:
    light: "#F1F5F9"
    dark: "#334155"
  mutedForeground:
    light: "#6B7280"
    dark: "#94A3B8"

# Navigation
navigation:
  main:
    - label: "Home"
      path: "/"
    - label: "Services"
      path: "/services"
    - label: "About"
      path: "/about"
    - label: "api0.ai"
      path: "https://api0.ai"
      external: true
    - label: "Contact"
      path: "/contact"

# Services from your content plan
services:
  - title: "Rust Training"
    description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization."
    cta: "Schedule a Training Session"
    ctaLink: "/contact?service=rust-training"
    icon: "Code"
  
  - title: "LLM Integration"
    description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing."
    cta: "Get a Free Consultation"
    ctaLink: "/contact?service=llm-integration"
    icon: "Brain"
  
  - title: "AI Agent Development"
    description: "Build intelligent AI agents for automation, decision-making, and process optimization."
    cta: "Start Your Agent Project"
    ctaLink: "/contact?service=ai-agent"
    icon: "Robot"
  
  - title: "api0.ai Solutions"
    description: "Cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations."
    cta: "Try api0.ai Now"
    ctaLink: "https://api0.ai"
    icon: "Network"

# Portfolio items
portfolio:
  - title: "Rust Training for Java Developers"
    description: "Delivering hands-on Rust training programs tailored for Java developers, enabling them to master Rust with the same fluency as Java."
    category: "Training"
  
  - title: "LLM-Powered Chatbot"
    description: "Integrated an LLM into a client's customer service platform, reducing response times by 40%."
    category: "Integration"
  
  - title: "api0.ai Implementation"
    description: "Helped an e-commerce client map user queries to product APIs, cutting integration time by 50%."
    category: "Development"

# Settings for logging as per your preference
logging:
  level: "trace"
  format: "json"
  output: "console"
````

## File: src/app/[locale]/about/page.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  const skills = [
    { category: t('programming'), items: ["Rust", "TypeScript", "Python", "WebAssembly"] },
    { category: t('ai_ml'), items: ["LLM Integration", "NLP", "AI Agent Development", "Prompt Engineering"] },
    { category: t('infrastructure'), items: ["AWS", "Docker", "Kubernetes", "gRPC"] },
    { category: t('frontend'), items: ["React", "Next.js", "Tailwind CSS", "WebSockets"] }
  ];

  const values = [
    {
      title: t('technical_excellence.title'),
      description: t('technical_excellence.description')
    },
    {
      title: t('continuous_learning.title'),
      description: t('continuous_learning.description')
    },
    {
      title: t('client_success.title'),
      description: t('client_success.description')
    },
    {
      title: t('simplicity.title'),
      description: t('simplicity.description')
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              className="relative h-96 rounded-xl overflow-hidden border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Placeholder for profile image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">Mayorana</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('who_i_am')}</h2>
              <div className="space-y-4 text-lg">
                <p>{t('description1')}</p>
                <p>{t('description2')}</p>
                <p>{t('description3')}</p>
                <p className="font-medium text-foreground">{t('description4')}</p>
              </div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">{t('skills_expertise')}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {skills.map((skillGroup) => (
                <div
                  key={skillGroup.category}
                  className="p-6 bg-secondary rounded-xl border border-border"
                >
                  <h3 className="font-semibold mb-4 text-primary">{skillGroup.category}</h3>
                  <ul className="space-y-2">
                    {skillGroup.items.map((skill) => (
                      <li key={skill} className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">{t('core_values')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-6 rounded-xl bg-secondary/50 border border-border"
                >
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* api0.ai Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('featured_project')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('project_subtitle')}
              </p>
            </div>

            <div className="bg-background p-8 rounded-xl border border-border mb-10">
              <p className="mb-6">{t('project_description1')}</p>
              <p className="mb-6">{t('project_description2')}</p>
              <div className="flex justify-center">
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('visit_api0')} <FiExternalLink className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_work_together')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta_description')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('common.get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/[locale]/blog/tag/[slug]/layout.tsx
````typescript
// File: src/app/blog/tag/[slug]/layout.tsx
import { Metadata } from 'next';
import { getTagBySlug } from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string; locale: string }>; // Add locale
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params; // Get both
  const tag = getTagBySlug(slug, locale); // Add locale

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag} - Blog`,
    description: `Articles about ${tag}`,
  };
}

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/blog/tag/[slug]/page.tsx
````typescript
// File: src/app/blog/tag/[slug]/page.tsx
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import {
  getAllTags,
  getPostsByTag,
  getTagBySlug,
} from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string; locale: string }>; // Add locale to type
}

// Generate static parameters for tags
export async function generateStaticParams() {
  try {
    const locales = ['en', 'fr']; // Your supported locales
    const params = [];

    for (const locale of locales) {
      const tags = getAllTags(locale);
      for (const tag of tags) {
        params.push({
          locale,
          slug: tag.toLowerCase().replace(/\s+/g, '-')
        });
      }
    }

    return params;
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

export default async function TagPage({ params }: Props) {
  try {
    const { slug } = await params;
    const locale = await params.then(p => p.locale); // Get locale from params

    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const currentTag = getTagBySlug(slug, locale); // Add locale

    if (!currentTag) {
      notFound();
    }

    const posts = getPostsByTag(slug, locale); // Add locale
    const tags = getAllTags(locale); // Add locale

    return (
      <LayoutTemplate>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                #{currentTag}
              </h1>
              <p className="text-xl text-muted-foreground">
                {posts.length} article{posts.length !== 1 ? 's' : ''} about {currentTag}
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-12 gap-12">
              {/* Sidebar */}
              <div className="md:col-span-3">
                <TagFilter
                  tags={tags}
                  currentTag={currentTag}
                />
              </div>

              {/* Main Content */}
              <div className="md:col-span-9">
                <BlogList posts={posts} title="" description="" />
              </div>
            </div>
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in TagPage:', error);
    notFound();
  }
}
````

## File: src/app/[locale]/blog/layout.tsx
````typescript
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('blog_title'),
    description: t('blog_description'),
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/[locale]/blog/page.tsx
````typescript
// File: src/app/[locale]/blog/page.tsx
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import Pagination from '@/components/blog/Pagination';
import {
  getPaginatedPosts,
  getAllTags,
} from '@/lib/blog';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const page = parseInt(searchParamsData.page as string) || 1;

  const paginatedData = getPaginatedPosts(page, locale);
  const tags = getAllTags(locale);
  const t = await getTranslations('blog');

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t('hero_title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <TagFilter
                tags={tags}
                currentTag={undefined}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {paginatedData.totalPosts > 0 ? (
                    <>
                      Showing {paginatedData.posts.length} of {paginatedData.totalPosts} {paginatedData.totalPosts === 1 ? t('article') : 'articles'}
                      {paginatedData.totalPages > 1 && (
                        <span> • Page {paginatedData.currentPage} of {paginatedData.totalPages}</span>
                      )}
                    </>
                  ) : (
                    <span>{t('no_posts')}</span>
                  )}
                </p>
              </div>

              <BlogList
                posts={paginatedData.posts}
                title=""
                description=""
              />

              <Pagination
                currentPage={paginatedData.currentPage}
                totalPages={paginatedData.totalPages}
                baseUrl={`/${locale}/blog`}
              />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/[locale]/services/page.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FaCode, FaBrain, FaRobot, FaArrowRight } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

export default function ServicesPage() {
  const t = useTranslations('services');
  const tHome = useTranslations('home');
  const locale = useLocale();

  const services = [
    {
      id: "rust-training",
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: t('rust_training.title'),
      description: t('rust_training.description'),
      benefits: [
        t('rust_training.benefit1'),
        t('rust_training.benefit2'),
        t('rust_training.benefit3'),
        t('rust_training.benefit4')
      ],
      cta: t('rust_training.cta'),
      link: `/${locale}/contact?service=rust-training`
    },
    {
      id: "llm-integration",
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: t('llm_integration.title'),
      description: t('llm_integration.description'),
      benefits: [
        t('llm_integration.benefit1'),
        t('llm_integration.benefit2'),
        t('llm_integration.benefit3'),
        t('llm_integration.benefit4')
      ],
      cta: t('llm_integration.cta'),
      link: `/${locale}/contact?service=llm-integration`
    },
    {
      id: "ai-agent",
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: t('ai_agent.title'),
      description: t('ai_agent.description'),
      benefits: [
        t('ai_agent.benefit1'),
        t('ai_agent.benefit2'),
        t('ai_agent.benefit3'),
        t('ai_agent.benefit4')
      ],
      cta: t('ai_agent.cta'),
      link: `/${locale}/contact?service=ai-agent`
    },
    {
      id: "api0",
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: t('api0.title'),
      description: t('api0.description'),
      benefits: [
        t('api0.benefit1'),
        t('api0.benefit2'),
        t('api0.benefit3'),
        t('api0.benefit4')
      ],
      cta: t('api0.cta'),
      link: "https://api0.ai"
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tHome('what_i_offer')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {tHome('services_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-20"
              >
                <motion.div
                  className="grid md:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={index % 2 === 0 ? "order-1" : "order-1 md:order-2"}>
                    <div className="mb-6 p-4 inline-flex bg-primary/10 rounded-full">
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold mb-6">{service.title}</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      {service.description}
                    </p>
                    <Link
                      href={service.link}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                    >
                      {service.cta} <FaArrowRight className="ml-2" />
                    </Link>
                  </div>

                  <div className={index % 2 === 0 ? "order-2" : "order-2 md:order-1"}>
                    <div className="bg-secondary p-8 rounded-xl border border-border">
                      <h3 className="font-semibold mb-4">{t('key_benefits')}</h3>
                      <ul className="space-y-4">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-3 text-primary font-bold">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_get_started')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('contact_description')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {tHome('get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/[locale]/page.tsx
````typescript
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import { getRecentPosts } from '@/lib/blog';
import ClientHomeSection from '@/components/home/ClientHomeSection';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  // Fetch data directly in the server component
  const recentPosts = getRecentPosts(3);
  const t = useTranslations('home');
  debugger
  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <ClientHomeSection />

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('latest_insights')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('insights_subtitle')}
            </p>
          </div>
          <BlogList posts={recentPosts} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('view_all_articles')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/components/blog/TagFilter.tsx
````typescript
// Simplified TagFilter component (tags only)
// File: src/components/blog/TagFilter.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface TagFilterProps {
  tags: string[];
  currentTag?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, currentTag }) => {
  const locale = useLocale();
  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-4">Filter by Topic</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/blog`} // Add locale prefix
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!currentTag
            ? 'bg-primary text-white'
            : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
        >
          All
        </Link>

        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/${locale}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentTag === tag
              ? 'bg-primary text-white'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
````

## File: src/components/home/ClientHomeSection.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from '@/components/ui/Motion';
import { FaBrain, FaCode, FaNetworkWired, FaRobot } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const tServices = useTranslations('services');
  const tTestimonials = useTranslations('testimonials');
  const tPortfolio = useTranslations('portfolio');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  const services = [
    {
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: tServices('rust_training.title'),
      description: tServices('rust_training.description'),
      cta: tServices('rust_training.cta'),
      link: getLocalizedPath("/contact?service=rust-training")
    },
    {
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: tServices('llm_integration.title'),
      description: tServices('llm_integration.description'),
      cta: tServices('llm_integration.cta'),
      link: getLocalizedPath("/contact?service=llm-integration")
    },
    {
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: tServices('ai_agent.title'),
      description: tServices('ai_agent.description'),
      cta: tServices('ai_agent.cta'),
      link: getLocalizedPath("/contact?service=ai-agent")
    },
    {
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: tServices('api0.title'),
      description: tServices('api0.description'),
      cta: tServices('api0.cta'),
      link: "https://api0.ai"
    }
  ];

  const testimonials = [
    {
      quote: tTestimonials('fintech_lead.quote'),
      author: tTestimonials('fintech_lead.author')
    },
    {
      quote: tTestimonials('ecommerce_cto.quote'),
      author: tTestimonials('ecommerce_cto.author')
    }
  ];

  const portfolio = [
    {
      title: tPortfolio('rust_training_java.title'),
      description: tPortfolio('rust_training_java.description'),
      category: tPortfolio('rust_training_java.category')
    },
    {
      title: tPortfolio('llm_chatbot.title'),
      description: tPortfolio('llm_chatbot.description'),
      category: tPortfolio('llm_chatbot.category')
    },
    {
      title: tPortfolio('api0_implementation.title'),
      description: tPortfolio('api0_implementation.description'),
      category: tPortfolio('api0_implementation.category')
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('discover_api0')}
              </Link>
              <Link
                href={getLocalizedPath("/contact?service=rust-training")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                {t('book_rust_training')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('what_i_offer')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('services_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-6 p-4 bg-primary/10 rounded-full">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <Link
                  href={service.link}
                  className="text-primary font-medium hover:underline mt-auto"
                >
                  {service.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* api0.ai Spotlight */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('discover_api0_title')}</h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('api0_description')}
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature1')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature2')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature3')}</span>
                </li>
              </ul>
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
              >
                {t('explore_api0')}
              </Link>
            </motion.div>
            <motion.div
              className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border max-w-md">
                  <code className="text-sm block font-mono">
                    <span className="text-blue-600">const</span> <span className="text-green-600">api0</span> = <span className="text-blue-600">await</span> Api0.<span className="text-purple-600">initialize</span>({"{"}
                    <br />
                    &nbsp;&nbsp;apiKey: <span className="text-orange-600">&ldquo;your-api-key&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;domainRestriction: <span className="text-orange-600">&ldquo;yourcompany.com&rdquo;</span>
                    <br />
                    {"}"});
                    <br /><br />
                    <span className="text-blue-600">const</span> <span className="text-green-600">result</span> = <span className="text-blue-600">await</span> api0.<span className="text-purple-600">match</span>({"{"}
                    <br />
                    &nbsp;&nbsp;input: <span className="text-orange-600">&ldquo;Find products under $50&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;context: {"{"}...{"}"};
                    <br />
                    {"}"});
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('my_work')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('work_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolio.map((item, index) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-2 text-sm font-medium text-primary">
                  {item.category}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href={getLocalizedPath("/contact")}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('contact_custom_solutions')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('what_clients_say')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('testimonials_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-background border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-primary text-4xl mb-4">&ldquo;</div>
                <p className="text-foreground mb-6 italic">
                  {testimonial.quote}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_elevate')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta_description')}
            </p>
            <Link
              href={getLocalizedPath("/contact")}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
````

## File: src/components/ui/WhatsAppButton.tsx
````typescript
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
  const whatsappNumber = "+41764837540";
  const whatsappMessage = "Hello, I'd like to learn more about your services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'floating_button'
        }
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Contact via WhatsApp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
````

## File: src/types/globals.d.ts
````typescript
export {};

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: Record<string, string> }): void;
      q?: Array<unknown>;
    };
  }
}
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts


# Generated blog data (auto-regenerated on deployment)
src/data/blog-posts.json
src/data/blog-categories.json

# Generated sitemap
public/sitemap.xml

# Scheduling runtime files
.last-publish
.publishing-paused
.skip-today
.queue-state.json
````

## File: postcss.config.mjs
````
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    // Add type roots but keep paths simple
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ],
    // Simplified paths to avoid Turbopack error
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/types/**/*.d.ts" // Explicitly include your type declaration files
  ],
  "exclude": [
    "node_modules"
  ]
}
````

## File: messages/fr.json
````json
{
  "metadata": {
    "site_title": "Mayorana - Solutions Rust, IA et API",
    "site_description": "Stimuler l'innovation avec des solutions Rust, IA et API",
    "about_title": "À propos",
    "about_description": "Découvrez Mayorana et les services spécialisés en Rust, agents IA et solutions API.",
    "blog_title": "Blog - Mayorana",
    "blog_description": "Insights et articles sur Rust, l'IA et le développement logiciel moderne.",
    "contact_title": "Contact",
    "contact_description": "Contactez-nous pour la formation Rust, l'intégration LLM, le développement d'agents IA et les solutions api0.ai.",
    "services_title": "Services",
    "services_description": "Services experts en formation Rust, intégration LLM, développement d'agents IA et solutions api0.ai."
  },
  "navigation": {
    "home": "Accueil",
    "services": "Services",
    "blog": "Blog",
    "about": "À propos",
    "contact": "Contact",
    "get_started": "Commencer",
    "toggle_theme": "Changer le thème",
    "toggle_menu": "Basculer le menu"
  },
  "home": {
    "hero_title": "Des solutions plus intelligentes avec Rust et l'IA",
    "hero_subtitle": "Spécialisé dans la formation Rust, l'intégration LLM et le développement d'agents IA pour les entreprises en Suisse et au-delà.",
    "discover_api0": "Découvrir api0.ai",
    "book_rust_training": "Réserver une formation Rust",
    "what_i_offer": "Mon offre",
    "services_subtitle": "Services spécialisés qui aident les entreprises à innover et se transformer grâce à des solutions technologiques modernes.",
    "latest_insights": "Derniers insights",
    "insights_subtitle": "Réflexions et tutoriels sur Rust, l'intégration LLM et le développement d'agents IA.",
    "view_all_articles": "Voir tous les articles",
    "discover_api0_title": "Découvrir api0.ai",
    "api0_description": "api0.ai est ma solution phare pour les entreprises cherchant à rationaliser les intégrations API. Utilisant le NLP avancé, elle fait correspondre intelligemment les phrases utilisateur aux bons endpoints API, réduisant le temps de développement et la complexité.",
    "api0_feature1": "Configuration minimale avec le SDK JavaScript",
    "api0_feature2": "Gestion sécurisée des clés API",
    "api0_feature3": "Évolutif pour les besoins d'entreprise",
    "explore_api0": "Explorer api0.ai",
    "my_work": "Mon travail",
    "work_subtitle": "Présentation de projets réussis et collaborations à travers la Suisse.",
    "contact_custom_solutions": "Me contacter pour des solutions personnalisées",
    "what_clients_say": "Ce que disent les clients",
    "testimonials_subtitle": "Les expériences de ceux qui ont bénéficié de mes services.",
    "ready_elevate": "Prêt à améliorer votre stack technique ?",
    "cta_description": "Contactez-moi pour des solutions personnalisées qui exploitent l'innovation.",
    "get_in_touch": "Prise de contact"
  },
  "services": {
    "rust_training": {
      "title": "Formation Rust",
      "description": "Formation Rust dirigée par des experts pour les professionnels et équipes, couvrant la sécurité mémoire, la concurrence et l'optimisation des performances. Cours adaptés des débutants aux développeurs avancés, avec des applications réelles en fintech, programmation système et plus.",
      "cta": "Planifier une session de formation",
      "benefit1": "Maîtriser le système de propriété et les fonctionnalités de sécurité mémoire de Rust",
      "benefit2": "Apprendre la programmation concurrente avec les garanties de Rust",
      "benefit3": "Comprendre les techniques d'optimisation des performances",
      "benefit4": "Appliquer Rust aux problèmes réels de votre domaine"
    },
    "llm_integration": {
      "title": "Intégration LLM",
      "description": "Connecter de manière transparente les grands modèles de langage (LLM) à vos applications pour une automatisation améliorée, chatbots et traitement de données. Solutions personnalisées conçues pour s'intégrer à vos systèmes existants, garantissant évolutivité et performance.",
      "cta": "Obtenir une consultation gratuite",
      "benefit1": "Intégrer les LLM leaders dans vos produits existants",
      "benefit2": "Construire des bases de connaissances personnalisées pour des applications spécifiques au domaine",
      "benefit3": "Implémenter des frameworks d'ingénierie de prompts évolutifs",
      "benefit4": "Créer des systèmes d'évaluation robustes pour les sorties LLM"
    },
    "ai_agent": {
      "title": "Développement d'agents IA",
      "description": "Construire des agents IA intelligents pour l'automatisation, la prise de décision et l'optimisation des processus. Du concept au déploiement, je crée des agents qui exploitent le NLP et gRPC pour des performances de niveau entreprise.",
      "cta": "Démarrer votre projet d'agent",
      "benefit1": "Automatiser des workflows complexes avec des agents intelligents",
      "benefit2": "Créer des agents capables de raisonner sur votre domaine",
      "benefit3": "Se connecter à plusieurs sources de données et API",
      "benefit4": "Construire des systèmes auto-améliorants avec des boucles de rétroaction"
    },
    "api0": {
      "title": "Solutions api0.ai",
      "description": "Promouvoir api0.ai, ma plateforme de pointe qui utilise le NLP avancé pour faire correspondre les entrées utilisateur aux endpoints API, simplifiant les intégrations pour les entreprises. Facile à utiliser, sécurisé et conçu pour une configuration minimale.",
      "cta": "Essayer api0.ai maintenant",
      "benefit1": "Faire correspondre les entrées en langage naturel aux bons endpoints API",
      "benefit2": "Réduire le temps d'intégration et la complexité",
      "benefit3": "Gestion sécurisée des clés API avec restrictions de domaine",
      "benefit4": "Évoluer de manière transparente pour le trafic de niveau entreprise"
    },
    "key_benefits": "Avantages clés",
    "ready_get_started": "Prêt à commencer ?",
    "contact_description": "Contactez-moi pour discuter de vos besoins spécifiques et comment mes services peuvent aider votre entreprise à innover et croître."
  },
  "about": {
    "hero_title": "À propos de moi",
    "hero_subtitle": "Apporter une expertise en Rust, agents IA et solutions API aux clients du monde entier",
    "who_i_am": "A propos de moi",
    "description1": "En tant qu'entrepreneur individuel basé en Suisse, je me spécialise dans la livraison de solutions de pointe en programmation Rust, développement d'agents IA et intégrations LLM transparentes.",
    "description2": "Avec une passion pour simplifier les systèmes complexes, j'aide les entreprises grâce à une formation Rust sur mesure et des outils innovants comme api0.ai, ma solution de correspondance API pilotée par NLP.",
    "description3": "Mon travail allie expertise technique et engagement à stimuler l'efficacité et l'innovation pour les entreprises du monde entier.",
    "description4": "Opérant fièrement depuis le cœur de la Suisse, j'apporte précision et fiabilité à chaque projet.",
    "skills_expertise": "Compétences et expertise",
    "programming": "Programmation",
    "ai_ml": "IA et ML",
    "infrastructure": "Infrastructure",
    "frontend": "Frontend",
    "core_values": "Valeurs fondamentales",
    "technical_excellence": {
      "title": "Excellence technique",
      "description": "Construire des systèmes robustes, performants et maintenables."
    },
    "continuous_learning": {
      "title": "Apprentissage continu",
      "description": "Rester à la pointe de la technologie pour livrer des solutions de pointe."
    },
    "client_success": {
      "title": "Succès client",
      "description": "Se concentrer sur les résultats qui génèrent une vraie valeur."
    },
    "simplicity": {
      "title": "Simplicité",
      "description": "Créer des solutions qui réduisent la complexité et sont faciles à comprendre."
    },
    "featured_project": "Projet vedette : api0.ai",
    "project_subtitle": "Mon innovation phare, rationalisant les intégrations API grâce au NLP avancé",
    "project_description1": "api0.ai représente l'aboutissement de mon travail en IA et intégration API, fournissant une solution qui fait correspondre intelligemment les entrées en langage naturel aux bons endpoints API.",
    "project_description2": "Utilisant le traitement de langage naturel avancé, api0.ai simplifie le processus d'intégration pour les entreprises, réduisant le temps de développement et la complexité tout en fournissant des fonctionnalités de sécurité robustes.",
    "visit_api0": "Visiter api0.ai",
    "ready_work_together": "Prêt à travailler ensemble ?",
    "cta_description": "Discutons de comment je peux aider vous à atteindre vos objectifs avec des solutions technologiques innovantes."
  },
  "contact": {
    "hero_title": "Entrer en contact",
    "hero_subtitle": "Prêt à améliorer votre stack technique avec Rust, l'IA ou api0.ai ? Discutons de comment je peux aider votre entreprise à réussir.",
    "faster_response": "Pour une réponse plus rapide sur mobile :",
    "contact_via_whatsapp": "Contacter moi via WhatsApp",
    "contact_information": "Informations de contact",
    "location_description": "Basé en Suisse, je suis là pour aider les clients globaux et locaux.",
    "email": "Email",
    "location": "Localisation",
    "linkedin": "LinkedIn",
    "response_time": "Temps de réponse",
    "response_description": "Je réponds généralement aux demandes dans les 4 heures.",
    "send_message": "Envoyer un message",
    "name": "Nom",
    "company_optional": "Entreprise (Optionnel)",
    "service_interest": "Service d'intérêt",
    "select_service": "Sélectionner un service",
    "message": "Message",
    "message_placeholder": "Comment puis-je vous aider ?",
    "sending": "Envoi...",
    "send_message_button": "Envoyer le message",
    "message_sent_title": "Message envoyé avec succès !",
    "message_sent_description": "Merci de m'avoir contacté. Je vous répondrai dès que possible.",
    "send_another": "Envoyer un autre message",
    "required_field": "Champ requis",
    "name_required": "Le nom est requis",
    "email_required": "L'email est requis",
    "invalid_email": "Adresse email invalide",
    "service_required": "Veuillez sélectionner un service",
    "message_required": "Le message est requis"
  },
  "blog": {
    "hero_title": "Blog",
    "hero_subtitle": "Insights et articles sur Rust, l'IA et le développement logiciel moderne.",
    "filter_by_topic": "Filtrer par sujet",
    "all": "Tous",
    "no_posts": "Aucun article trouvé",
    "read_more": "Lire plus",
    "back_to_blog": "Retour au blog",
    "share": "Partager :",
    "share_twitter": "Partager sur X (Twitter)",
    "share_linkedin": "Partager sur LinkedIn",
    "copy_link": "Copier le lien",
    "link_copied": "Lien copié !",
    "table_contents": "Table des matières",
    "tags": "Étiquettes",
    "previous": "Précédent",
    "next": "Suivant",
    "article": "Article",
    "articles_about": "articles sur"
  },
  "footer": {
    "description": "Spécialisé en Rust, intégration LLM et développement d'agents IA. Basé en Suisse, servant des clients dans le monde entier.",
    "quick_links": "Liens rapides",
    "services": "Services",
    "connect": "Se connecter",
    "email_label": "Email :",
    "copyright": "Tous droits réservés.",
    "tagline": "Basé en Suisse, au service du monde"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "page_not_found": "Page non trouvée",
    "not_found_description": "La page que vous recherchez a peut-être été supprimée, son nom a changé ou elle est temporairement indisponible.",
    "return_home": "Retour à l'accueil",
    "switzerland": "Suisse"
  },
  "portfolio": {
    "rust_training_java": {
      "title": "Formation Rust pour développeurs Java",
      "description": "Livraison de programmes de formation Rust pratiques adaptés aux développeurs Java, leur permettant de maîtriser Rust avec la même fluidité que Java.",
      "category": "Formation"
    },
    "llm_chatbot": {
      "title": "Chatbot alimenté par LLM",
      "description": "Intégré un LLM dans la plateforme de service client d'un client, réduisant les temps de réponse de 40%.",
      "category": "Intégration"
    },
    "api0_implementation": {
      "title": "Implémentation api0.ai",
      "description": "Aidé un client e-commerce à mapper les requêtes utilisateur aux API produits, réduisant le temps d'intégration de 50%.",
      "category": "Développement"
    }
  },
  "testimonials": {
    "fintech_lead": {
      "quote": "La formation Rust a été transformatrice pour notre équipe de dev. Claire, pratique et parfaitement adaptée à nos besoins.",
      "author": "Gérant d'une Fintech à Zurich"
    },
    "ecommerce_cto": {
      "quote": "api0.ai a rendu nos intégrations API sans effort. C'est un game-changer pour notre plateforme.",
      "author": "CTO d'une solution E-commerce"
    }
  }
}
````

## File: scripts/generate-sitemap.js
````javascript
// Enhanced sitemap generation with better error handling and fallback
// File: scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BASE_URL = 'https://mayorana.ch';

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  // Try to read from JSON file first (generated by generate-blog-data.js)
  const postsPath = path.join(process.cwd(), 'src/data/blog-posts.json');

  let blogSlugs = [];
  let allTags = new Set();

  console.log('Checking for blog posts at:', postsPath);

  if (fs.existsSync(postsPath)) {
    try {
      const postsContent = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsContent);

      blogSlugs = posts.map(post => post.slug);

      // Collect all unique tags
      posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            allTags.add(tag.toLowerCase().replace(/\s+/g, '-'));
          });
        }
      });

      console.log(`✅ Found ${blogSlugs.length} blog posts and ${allTags.size} tags from JSON`);
    } catch (error) {
      console.warn('⚠️  Error reading blog posts JSON:', error.message);
      console.log('📁 Falling back to direct file system scan...');

      // Fallback: scan content directories directly
      const result = await scanContentDirectories();
      blogSlugs = result.slugs;
      allTags = result.tags;
    }
  } else {
    console.log('📁 Blog posts JSON not found, scanning content directories...');

    // Fallback: scan content directories directly
    const result = await scanContentDirectories();
    blogSlugs = result.slugs;
    allTags = result.tags;
  }

  // Start XML content
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Add all blog posts
  for (const slug of blogSlugs) {
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Add tag pages
  for (const tag of allTags) {
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/tag/${tag}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  console.log(`✅ Generated sitemap with ${5 + blogSlugs.length + allTags.size} URLs`);
  console.log(`   - Static pages: 5`);
  console.log(`   - Blog posts: ${blogSlugs.length}`);
  console.log(`   - Tag pages: ${allTags.size}`);

  return sitemap;
}

// Fallback function to scan content directories directly
async function scanContentDirectories() {
  const contentDirs = [
    path.join(process.cwd(), 'content/blog'),
    path.join(process.cwd(), 'content/queue') // Include queued content
  ];

  const slugs = [];
  const tags = new Set();

  for (const dir of contentDirs) {
    console.log(`Scanning directory: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files in ${path.basename(dir)}`);

    for (const file of files) {
      const filePath = path.join(dir, file);

      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        // Get slug from frontmatter or generate from filename
        const slug = data.slug || file.replace('.md', '');

        // Only add if not already present
        if (!slugs.includes(slug)) {
          slugs.push(slug);
          console.log(`  ✅ Added: ${slug}`);
        }

        // Collect tags
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach(tag => {
            const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
            tags.add(tagSlug);
          });
        }
      } catch (error) {
        console.warn(`⚠️  Error processing ${file}:`, error.message);
      }
    }
  }

  console.log(`✅ Direct scan found ${slugs.length} posts and ${tags.size} tags`);
  return { slugs, tags };
}

async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  writeSitemap().catch(console.error);
}

module.exports = { generateSitemap, writeSitemap };
````

## File: src/app/[locale]/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import { ThemeProvider } from "../providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { locales } from '../../../i18n';
import { notFound } from 'next/navigation';

import CanonicalMeta from '@/components/seo/CanonicalMeta';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      template: '%s | Mayorana',
      default: t('site_title'),
    },
    description: t('site_description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Get messages for the specific locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://plausible.io/js/script.outbound-links.js"
          data-domain="mayorana.ch"
          strategy="afterInteractive"
        />
        <Script id="plausible-setup" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments) 
            }
          `}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <CanonicalMeta />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
````

## File: src/app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Blog styles from blog.css */
.prose {
  max-width: 65ch;
  color: hsl(var(--foreground));
}

.prose a {
  color: hsl(var(--primary));
  text-decoration: underline;
  font-weight: 500;
}

.prose strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.prose ol > li::before {
  color: hsl(var(--muted-foreground));
}

.prose ul > li::before {
  background-color: hsl(var(--muted-foreground));
}

.prose hr {
  border-color: hsl(var(--border));
}

.prose blockquote {
  color: hsl(var(--muted-foreground));
  border-left-color: hsl(var(--border));
}

.prose blockquote p:first-of-type::before,
.prose blockquote p:last-of-type::after {
  content: "";
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: hsl(var(--foreground));
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose h1 {
  font-size: 2.25em;
  line-height: 1.1111111;
}

.prose h2 {
  font-size: 1.5em;
  line-height: 1.3333333;
}

.prose h3 {
  font-size: 1.25em;
  line-height: 1.6;
}

.prose h4 {
  font-size: 1.125em;
  line-height: 1.5;
}

.prose figure figcaption {
  color: hsl(var(--muted-foreground));
}

.prose code {
  color: hsl(var(--foreground));
  font-weight: 600;
  background-color: hsl(var(--muted));
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

.prose pre {
  color: hsl(var(--foreground));
  background-color: hsl(var(--muted));
  border-radius: 0.5rem;
  padding: 1em;
  overflow-x: auto;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  font-weight: inherit;
}

.prose img {
  border-radius: 0.5rem;
}

.prose table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  border-collapse: collapse;
}

.prose table thead {
  color: hsl(var(--foreground));
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: hsl(var(--border));
}

.prose table thead th {
  vertical-align: bottom;
  padding: 0.5em;
  padding-left: 0;
}

.prose table tbody tr {
  border-bottom-width: 1px;
  border-bottom-color: hsl(var(--border));
}

.prose table tbody td {
  vertical-align: top;
  padding: 0.5em;
  padding-left: 0;
}

/* Code highlighting with Prism */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a8494;
}

.token.punctuation {
  color: #a39e9b;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #f92672;
}

.token.boolean,
.token.number {
  color: #ae81ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a6e22e;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
  color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #e6db74;
}

.token.keyword {
  color: #66d9ef;
}

.token.regex,
.token.important {
  color: #fd971f;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

/* Dark mode adjustments */
.dark .prose {
  color: hsl(var(--foreground));
}

.dark .prose code {
  background-color: hsl(var(--secondary));
}

.dark .prose pre {
  background-color: hsl(var(--secondary));
}

/* Base styles from both globals.css files */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
 
    --primary: 25 100% 50%; /* #FF6B00 */
    --primary-foreground: 0 0% 100%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 25 100% 50%; /* #FF6B00 */
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Custom logo styling */
  .logo-zero {
    @apply font-black text-primary inline-block transition-transform duration-300;
    transform: rotate(-12deg);
  }
  
  .logo-zero-line {
    @apply absolute top-1/2 left-1/2 w-full h-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45;
  }
  
  .dark .logo-zero-line {
    @apply bg-foreground;
  }
  
  .light .logo-zero-line {
    @apply bg-background;
  }
  
  *:hover > .logo-zero {
    transform: rotate(0deg);
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .prose {
    font-size: 0.95rem;
  }
  
  .prose h1 {
    font-size: 1.875em;
  }
  
  .prose h2 {
    font-size: 1.375em;
  }
  
  .prose h3 {
    font-size: 1.125em;
  }
  
  .prose h4 {
    font-size: 1em;
  }
}


* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection for input fields, textareas, and other form elements */
input,
textarea,
select,
button,
[contenteditable="true"],
[contenteditable=""] {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection specifically for blog content */
.blog-content,
.blog-content *,
.prose,
.prose * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection for code blocks */
pre,
code,
pre *,
code * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection for any element with selectable class */
.selectable,
.selectable * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Ensure links are still clickable but text isn't selectable unless specifically allowed */
a {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow selection on links within blog content */
.blog-content a,
.prose a {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
````

## File: i18n.ts
````typescript
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Ensure that the incoming `locale` is valid
  let locale = await requestLocale;

  // Debug logging for production
  console.log('i18n config - requested locale:', locale);

  if (!locale || !locales.includes(locale as any)) {
    console.log('Invalid locale, using default:', defaultLocale);
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log('Loaded messages for locale:', locale);

    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error);

    // Fallback to English if the requested locale messages don't exist
    try {
      const fallbackMessages = (await import(`./messages/en.json`)).default;
      return {
        locale: 'en',
        messages: fallbackMessages
      };
    } catch (fallbackError) {
      console.error('Error loading fallback messages:', fallbackError);
      return {
        locale: 'en',
        messages: {}
      };
    }
  }
});
````

## File: scripts/generate-blog-data.js
````javascript
// Updated blog data generation script with i18n support
// File: scripts/generate-blog-data.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const readingTime = require('reading-time');

// Supported locales
const locales = ['en', 'fr'];

// Function to generate slug from title if not explicitly provided
function generateSlug(title) {
  // Add safety check for title
  if (!title || typeof title !== 'string') {
    console.warn('⚠️  Invalid title provided to generateSlug:', title);
    return 'untitled-post';
  }

  return slugify(title, {
    lower: true,
    strict: true
  });
}

// Function to remove H1 title from content (to avoid duplication)
function removeH1Title(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  // Remove the first H1 heading (usually the title)
  return content.replace(/^#\s+.*$/m, '').trim();
}

// Function to extract headings from markdown content (excluding the first H1)
function extractHeadings(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let isFirstH1 = true;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Skip the first H1 (usually the title)
    if (level === 1 && isFirstH1) {
      isFirstH1 = false;
      continue;
    }

    const id = slugify(text, { lower: true, strict: true });
    headings.push({ id, text, level });
  }

  return headings;
}

// Generate blog data for a specific locale
async function generateBlogDataForLocale(locale) {
  const postsDirectory = path.join(process.cwd(), `content/${locale}/blog/`);
  const outputPath = path.join(process.cwd(), `src/data/blog-posts-${locale}.json`);
  const categoriesOutputPath = path.join(process.cwd(), `src/data/blog-categories-${locale}.json`);

  console.log(`📖 Reading ${locale.toUpperCase()} posts from ${postsDirectory}`);

  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log(`📁 Created directory: ${postsDirectory}`);

    // Create empty data files for missing locales
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    fs.writeFileSync(categoriesOutputPath, JSON.stringify([], null, 2));
    console.log(`📝 Created empty data files for ${locale}`);
    return { posts: 0, categories: 0 };
  }

  // Read all markdown files in the posts directory
  const fileNames = fs.readdirSync(postsDirectory);

  // Track categories for the categories file
  const categoriesMap = new Map();

  const postsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      try {
        // Read file content
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Parse frontmatter
        const { data, content } = matter(fileContents);

        // Validate required fields
        if (!data.title) {
          console.error(`❌ Missing title in ${fileName}, skipping...`);
          return null;
        }

        // Generate slug from title if not provided
        const slug = data.slug || generateSlug(data.title);

        // Remove the first H1 title from content to avoid duplication
        const contentWithoutTitle = removeH1Title(content);

        // Convert markdown to HTML for rendering
        const contentHtml = marked(contentWithoutTitle);

        // Extract headings for table of contents (excluding the removed title)
        const headings = extractHeadings(contentWithoutTitle);

        // Calculate reading time
        const timeStats = readingTime(content);
        const readingTimeText = `${Math.ceil(timeStats.minutes)} min`;

        // Track category for categories file
        if (data.category) {
          if (!categoriesMap.has(data.category)) {
            categoriesMap.set(data.category, {
              slug: data.category,
              name: data.categoryName || data.category.charAt(0).toUpperCase() + data.category.slice(1),
              description: data.categoryDescription || `Articles about ${data.category}`
            });
          }
        }

        // Return structured data
        return {
          id: data.id || slug,
          slug,
          title: data.title,
          date: data.date || new Date().toISOString().split('T')[0],
          excerpt: data.excerpt || '',
          content: contentWithoutTitle, // Store content without title
          contentHtml,
          author: data.author || 'Anonymous',
          category: data.category || 'uncategorized',
          tags: Array.isArray(data.tags) ? data.tags : [],
          image: data.image,
          readingTime: readingTimeText,
          locale, // Add locale information
          seo: {
            title: data.seo_title || data.title,
            description: data.meta_description || data.excerpt || '',
            keywords: data.keywords || data.tags || [],
            ogImage: data.og_image || data.image
          },
          headings
        };
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
        return null;
      }
    })
    .filter(post => post !== null) // Remove failed posts
    // Sort by date (newest first)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write the posts data to a JSON file
  fs.writeFileSync(
    outputPath,
    JSON.stringify(postsData, null, 2)
  );

  // Convert categories map to array and write to file
  const categories = Array.from(categoriesMap.values());
  fs.writeFileSync(
    categoriesOutputPath,
    JSON.stringify(categories, null, 2)
  );

  console.log(`✅ Generated ${locale.toUpperCase()} blog data: ${postsData.length} posts, ${categories.length} categories`);

  return { posts: postsData.length, categories: categories.length };
}

// Main function to generate blog data for all locales
async function generateBlogData() {
  console.log('🚀 Starting i18n blog data generation...\n');

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let totalPosts = 0;
  let totalCategories = 0;

  // Generate data for each locale
  for (const locale of locales) {
    const result = await generateBlogDataForLocale(locale);
    totalPosts += result.posts;
    totalCategories += result.categories;
  }

  // Create fallback files for backward compatibility (uses English data)
  try {
    const englishPosts = require(path.join(process.cwd(), 'src/data/blog-posts-en.json'));
    const englishCategories = require(path.join(process.cwd(), 'src/data/blog-categories-en.json'));

    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/blog-posts.json'),
      JSON.stringify(englishPosts, null, 2)
    );

    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/blog-categories.json'),
      JSON.stringify(englishCategories, null, 2)
    );

    console.log('📄 Created fallback files (blog-posts.json, blog-categories.json)');
  } catch (error) {
    console.warn('⚠️  Could not create fallback files:', error.message);
  }

  console.log(`\n🎉 Blog data generation complete!`);
  console.log(`📊 Total: ${totalPosts} posts, ${totalCategories} categories across ${locales.length} languages`);
  console.log(`📁 Generated files:`);
  locales.forEach(locale => {
    console.log(`   - blog-posts-${locale}.json`);
    console.log(`   - blog-categories-${locale}.json`);
  });
}

// Run the function
generateBlogData().catch(console.error);
````

## File: src/app/[locale]/contact/page.tsx
````typescript
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { useForm } from 'react-hook-form';
import { FiMail, FiMapPin, FiLinkedin } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

interface FormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

// Separate component that uses useSearchParams
function ContactFormWithParams() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const t = useTranslations('contact');
  const tServices = useTranslations('services');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const whatsappNumber = "+41764837540";
  const whatsappMessage = locale === 'en'
    ? "Hello, I'd like to learn more about your services."
    : "Bonjour, j'aimerais en savoir plus sur vos services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'contact_page'
        }
      });
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Set the service field if it's provided in the query params
  useEffect(() => {
    if (service) {
      setValue('service', service as string);
    }
  }, [service, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('http://0.0.0.0:5009/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const services = [
    { value: "rust-training", label: tServices('rust_training.title') },
    { value: "llm-integration", label: tServices('llm_integration.title') },
    { value: "ai-agent", label: tServices('ai_agent.title') },
    { value: "api0", label: tServices('api0.title') },
    { value: "other", label: "Other" }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="md:hidden mt-8 mb-4">
        <p className="text-center text-muted-foreground text-sm mb-3">
          {t('faster_response')}
        </p>
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp className="h-5 w-5" />
          {t('contact_via_whatsapp')}
        </Link>
      </div>

      {/* Contact Form Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('contact_information')}</h2>
                <p className="text-muted-foreground mb-8">
                  {t('location_description')}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('email')}</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:contact@mayorana.ch" className="hover:text-primary">
                          contact@mayorana.ch
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('location')}</h3>
                      <p className="text-muted-foreground">{tCommon('switzerland')}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiLinkedin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('linkedin')}</h3>
                      <p className="text-muted-foreground">
                        <a
                          href="https://linkedin.com/company/mayorana"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          linkedin.com/company/mayorana
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-secondary rounded-xl border border-border">
                <h3 className="font-medium mb-2">{t('response_time')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('response_description')}
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {formSubmitted ? (
                <div className="bg-secondary p-8 rounded-xl border border-border text-center">
                  <div className="text-primary text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-4">{t('message_sent_title')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('message_sent_description')}
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t('send_another')}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-secondary p-8 rounded-xl border border-border"
                >
                  <h2 className="text-2xl font-bold mb-6">{t('send_message')}</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-medium">
                        {t('name')} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="John Doe" // Specific example
                        {...register('name', { required: t('name_required') })}
                      />
                      {errors.name && (
                        <p className="text-sm text-primary">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-medium">
                        {t('email')} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="john@company.com" // Specific example
                        {...register('email', {
                          required: t('email_required'),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t('invalid_email'),
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-primary">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="company" className="font-medium">
                      {t('company_optional')}
                    </label>
                    <input
                      id="company"
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder={t('company_optional')}
                      {...register('company')}
                    />
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="service" className="font-medium">
                      {t('service_interest')} <span className="text-primary">*</span>
                    </label>
                    <select
                      id="service"
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      {...register('service', { required: t('service_required') })}
                    >
                      <option value="">{t('select_service')}</option>
                      {services.map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-sm text-primary">{errors.service.message}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2 mb-6">
                    <label htmlFor="message" className="font-medium">
                      {t('message')} <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder={t('message_placeholder')}
                      {...register('message', { required: t('message_required') })}
                    />
                    {errors.message && (
                      <p className="text-sm text-primary">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? t('sending') : t('send_message_button')}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

// Fallback component to show while Suspense is loading
function ContactFormFallback() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  return (
    <div className="py-20 bg-gradient-to-b from-secondary to-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">{t('hero_title')}</h1>
          <p className="text-xl text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <LayoutTemplate>
      <Suspense fallback={<ContactFormFallback />}>
        <ContactFormWithParams />
      </Suspense>
    </LayoutTemplate>
  );
}
````

## File: src/app/page.tsx
````typescript
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootRedirectPage() {
  console.log('🏠 ROOT PAGE RUNNING - Middleware failed, using page redirect');

  try {
    // Get headers to detect language
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    console.log('🌐 Detected Accept-Language:', acceptLanguage);

    // Determine locale
    const userLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';

    console.log('🎯 Redirecting to locale:', userLocale);

    // Server-side redirect to the locale-specific home page
    redirect(`/${userLocale}`);

  } catch (error) {
    console.error('❌ Root redirect error:', error);

    // Fallback to English if anything goes wrong
    redirect('/en');
  }

  // This should never render, but just in case:
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
````

## File: src/components/blog/BlogPost.tsx
````typescript
// Enhanced BlogPost component with working social sharing
// File: src/components/blog/BlogPost.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost as BlogPostType, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';
import { FaTwitter, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate the full URL for the post
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://mayorana.ch/blog/${post.slug}`;
  };

  // Share on X (Twitter)
  const shareOnTwitter = () => {
    const url = getPostUrl();
    const text = `${post.title} by ${post.author}`;
    const hashtags = post.tags?.slice(0, 3).join(',') || 'rust,programming';

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;

    // Track the share event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Social Share', {
        props: {
          platform: 'twitter',
          post: post.slug
        }
      });
    }

    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const url = getPostUrl();
    const title = post.title;
    const summary = post.excerpt;

    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;

    // Track the share event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Social Share', {
        props: {
          platform: 'linkedin',
          post: post.slug
        }
      });
    }

    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link to clipboard
  const copyLink = async () => {
    const url = getPostUrl();

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);

      // Track the copy event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Link Copy', {
          props: {
            post: post.slug
          }
        });
      }

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <article className="w-full max-w-3xl mx-auto blog-content">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          {/* Show main tags instead of category */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <span>{formatDate(post.date)}</span>
            {post.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-primary font-medium">{post.author.charAt(0)}</span>
          </div>
          <span className="font-medium">{post.author}</span>
        </div>
      </motion.div>

      {post.headings && post.headings.length > 0 && (
        <motion.div
          className="mb-8 p-4 bg-secondary rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium mb-3">Table of Contents</h2>
          <nav>
            <ul className="space-y-2">
              {post.headings.map(heading => (
                <li
                  key={heading.id}
                  className="ml-[calc(1rem*var(--level))]"
                  style={{ '--level': heading.level - 1 } as React.CSSProperties}
                >
                  <a
                    href={`#${heading.id}`}
                    className="text-primary hover:underline"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}

      <motion.div
        className="prose prose-lg dark:prose-invert max-w-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags && post.tags.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-secondary px-3 py-1 rounded-full text-sm hover:bg-secondary/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="mt-12 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between items-center">
          <Link
            href="/blog"
            className="mb-4 sm:mb-0 inline-flex items-center text-primary font-medium hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground mr-2">Share:</span>

            {/* X (Twitter) Share Button */}
            <button
              onClick={shareOnTwitter}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label="Share on X (Twitter)"
              title="Share on X (Twitter)"
            >
              <FaTwitter className="h-4 w-4" />
            </button>

            {/* LinkedIn Share Button */}
            <button
              onClick={shareOnLinkedIn}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              aria-label="Share on LinkedIn"
              title="Share on LinkedIn"
            >
              <FaLinkedin className="h-4 w-4" />
            </button>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${linkCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              aria-label="Copy link"
              title={linkCopied ? 'Link copied!' : 'Copy link'}
            >
              {linkCopied ? (
                <FaCheck className="h-4 w-4" />
              ) : (
                <FaLink className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Success message for link copy */}
        {linkCopied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ Link copied to clipboard!
            </span>
          </motion.div>
        )}
      </motion.div>
    </article>
  );
};

export default BlogPost;
````

## File: src/components/layout/Footer.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { FiLinkedin, FiGithub, FiMail } from 'react-icons/fi';
import { useTranslations, useLocale } from 'next-intl';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const tServices = useTranslations('services');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  const footerNav = [
    { label: tNav('home'), path: "/" },
    { label: tNav('services'), path: "/services" },
    { label: tNav('about'), path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: tNav('contact'), path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" }
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Company Description */}
          <div className="space-y-4">
            <Link href={getLocalizedPath("/")} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">mayorana</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('description')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('quick_links')}</h3>
            <ul className="space-y-2">
              {footerNav.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.external ? item.path : getLocalizedPath(item.path)}
                    target={item.external ? "_blank" : "_self"}
                    rel={item.external ? "noopener noreferrer" : ""}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={getLocalizedPath("/services#rust-training")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('rust_training.title')}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/services#llm-integration")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('llm_integration.title')}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/services#ai-agent")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('ai_agent.title')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('api0.title')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('connect')}</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://linkedin.com/company/mayorana"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/bennekrouf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@mayorana.ch"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <FiMail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('email_label')} contact@mayorana.ch
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Mayorana.ch. {t('copyright')}
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            {t('tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
````

## File: src/components/layout/Layout.tsx
````typescript
import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Mayorana | Rust, AI, and API Solutions",
  description = "Empowering Innovation with Rust, AI, and API Solutions"
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Remove any script tags from Head */}
      </Head>

      {/* Use Script component for Plausible */}
      <Script
        src="https://plausible.io/js/script.hash.outbound-links.js"
        data-domain="mayorana.ch"
        strategy="afterInteractive"
      />

      {/* Use Script component for setup code */}
      <Script id="plausible-setup" strategy="afterInteractive">
        {`
          window.plausible = window.plausible || function() { 
            (window.plausible.q = window.plausible.q || []).push(arguments);
          };
        `}
      </Script>

      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
````

## File: scripts/schedule-publish.js
````javascript
#!/usr/bin/env node
// Enhanced schedule-publish.js with i18n support
// File: scripts/schedule-publish.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

console.log('Script started with args:', process.argv);

if (process.argv.includes('--publish')) {
  console.log('Publishing mode activated');

  // Get the project root directory (one level up from scripts)
  const projectRoot = path.resolve(__dirname, '..');
  const queueDir = path.join(projectRoot, 'content/queue');

  // Support for both locales
  const locales = ['en', 'fr'];
  const blogDirs = {
    'en': path.join(projectRoot, 'content/en/blog'),
    'fr': path.join(projectRoot, 'content/fr/blog')
  };

  console.log('Queue directory:', queueDir);
  console.log('Blog directories:', blogDirs);

  // Ensure blog directories exist
  for (const locale of locales) {
    if (!fs.existsSync(blogDirs[locale])) {
      fs.mkdirSync(blogDirs[locale], { recursive: true });
      console.log(`📁 Created directory: ${blogDirs[locale]}`);
    }
  }

  // Look for Markdown files in queue
  const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
  console.log('Found files:', files);

  if (files.length > 0) {
    const file = files[0];
    const sourcePath = path.join(queueDir, file);

    console.log('Processing:', file);

    try {
      // Read and parse the Markdown file with frontmatter
      const fileContents = fs.readFileSync(sourcePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Determine locale from frontmatter (default to 'en')
      const locale = data.locale || 'en';
      console.log('Article locale:', locale);

      // Validate locale
      if (!locales.includes(locale)) {
        console.warn(`⚠️  Unknown locale '${locale}', defaulting to 'en'`);
        data.locale = 'en';
      }

      const targetDir = blogDirs[data.locale || 'en'];
      const targetPath = path.join(targetDir, file);

      // Update the date to today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      data.date = today;

      // Remove ALL scheduling and workflow metadata
      delete data.scheduledFor;
      delete data.scheduledAt;
      delete data.queuedAt;
      delete data.priority;
      delete data.content_focus;
      delete data.technical_level;

      console.log('Updated date to:', today);
      console.log('Target directory:', targetDir);

      // Create the updated Markdown content
      const markdownContent = matter.stringify(content, data);

      // Write the updated content to appropriate locale blog directory
      fs.writeFileSync(targetPath, markdownContent);

      // Remove from queue
      fs.unlinkSync(sourcePath);

      console.log('✅ Successfully published:', file);
      console.log('📅 Date updated to:', today);
      console.log('🌍 Published to locale:', data.locale || 'en');
      console.log('🗑️  Removed scheduling metadata');
      process.exit(0);

    } catch (error) {
      console.error('❌ Publishing failed:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }
  } else {
    console.log('❌ No Markdown files to publish');
    process.exit(1);
  }
} else {
  console.log('❌ No --publish flag provided');
  process.exit(1);
}
````

## File: README.md
````markdown
# Mayorana.ch Website

A modern, responsive website for mayorana.ch built with Next.js and Tailwind CSS.

## Features

- Clean, modern interface with responsive design
- Light and dark mode support
- Configurable via YAML files
- Pages for Services, About, and Contact
- Blog with category filtering and markdown support
- api0.ai solution showcase

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Icons**: React Icons
- **Configuration**: js-yaml

## Getting Started

```bash
# Clone the repository
git clone https://github.com/bennekrouf/mayorana.git

# Navigate to project directory
cd mayorana

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Folder Structure

```
mayorana-website/
├── config/           # YAML configuration files
├── public/           # Static assets
│   └── images/       # Image files
├── src/
│   ├── components/   # Reusable components
│   │   ├── layout/   # Layout components
│   │   └── ui/       # UI components
│   ├── lib/          # Utility functions
│   ├── pages/        # Page components
│   └── styles/       # Global styles
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Configuration

The website uses YAML files for configuration located in the `config/` directory. The main configuration file is `site.yaml`.

## Deployment

The website can be deployed to Vercel:

```bash
# Install Vercel CLI
yarn global add vercel

# Deploy to Vercel
vercel


## Server Publishing Setup

### 🚀 Quick Setup (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/bennekrouf/mayorana.git /path/to/mayorana
cd /path/to/mayorana
yarn install --frozen-lockfile

# 2. Create content directories
mkdir -p content/{drafts,queue,blog}

# 3. Make scripts executable
chmod +x scripts/*.sh

# 4. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Add daily cron job
echo "0 9 * * * cd ~/mayorana && ./scripts/daily-publish.sh" | crontab -

# ✅ Done! System will publish one article daily at 9 AM
```

### 📝 Content Workflow

```bash
# Write articles locally
vim content/drafts/my-article.md

# Queue for publishing  
node scripts/blog-cli.js queue add "my-article.md"

# Commit and push
git add content/ && git commit -m "Queue: New article" && git push

# Server automatically publishes daily at 9 AM
```

### 🎛️ Optional Configuration

```bash
# Set Slack notifications (optional)
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

# Change site URL in scripts/daily-publish.sh if needed
# Default: https://mayorana.ch

# Emergency controls
touch .publishing-paused    # Pause all publishing
touch .skip-today          # Skip today only
rm .publishing-paused      # Resume publishing
```

### 📊 Monitoring

```bash
# Check status
node scripts/blog-cli.js status

# View logs  
tail -f /var/log/blog-publishing.log

# Preview schedule
node scripts/blog-cli.js preview 14
```

### 🔧 Smart Defaults

The system works out-of-the-box with these intelligent defaults:

- **Publishing time**: 9 AM daily
- **Preferred days**: Tuesday, Wednesday, Thursday  
- **Skip weekends**: Yes
- **Max per day**: 1 article
- **Auto-backup**: Yes (keeps 3 days)
- **Health checks**: Automatic
- **SEO pings**: Google & Bing
- **Error handling**: Graceful with logs

No configuration files needed - just works!
```

## License

MIT
````

## File: src/components/blog/BlogList.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

interface BlogListProps {
  posts: BlogPost[];
  title?: string;
  description?: string;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  title,
  description
}) => {
  const t = useTranslations('blog');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  // Only show title/description if explicitly provided
  const showHeader = title || description;

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-12 text-center">
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              className="flex flex-col h-full rounded-xl border border-border overflow-hidden bg-secondary/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="mb-2">
                  <span className="text-sm font-medium text-primary">
                    {post.tags?.[0] || t('article')}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(post.date)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  <Link
                    href={getLocalizedPath(`/blog/${post.slug}`)}
                    className="hover:text-primary transition-colors"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto">
                  <Link
                    href={getLocalizedPath(`/blog/${post.slug}`)}
                    className="text-primary font-medium hover:underline inline-flex items-center"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    {t('read_more')}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-border rounded-xl bg-secondary/50">
          <p className="text-lg text-muted-foreground">{t('no_posts')}</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
````

## File: src/components/layout/Navbar.tsx
````typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const locale = useLocale();

  // Navigation items
  const navItems = [
    { label: t('home'), path: "/" },
    { label: t('services'), path: "/services" },
    { label: t('blog'), path: "/blog" },
    { label: t('about'), path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: t('contact'), path: "/contact" }
  ];

  // Language options - using language codes instead of flags
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ];

  // After mounting, we can safely access the theme
  useEffect(() => setMounted(true), []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLangMenu = () => setShowLangMenu(!showLangMenu);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Helper function to check if a link is active
  const isLinkActive = (path: string) => {
    const currentPath = pathname.replace(/\/$/, '');
    const normalizedPath = path.replace(/\/$/, '');
    return currentPath === `/${locale}${normalizedPath}` ||
      (path === '/' && currentPath === `/${locale}`);
  };

  // Get current language info
  const currentLang = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2"
          >
            <span className="font-bold text-xl text-foreground">mayorana</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.external ? item.path : `/${locale}${item.path}`}
              target={item.external ? "_blank" : "_self"}
              rel={item.external ? "noopener noreferrer" : ""}
              className={`text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={toggleLangMenu}
              className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors flex items-center"
              aria-label="Change Language"
            >
              <FiGlobe className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={pathname.replace(/^\/[a-z]{2}/, `/${lang.code}`)}
                    className={`flex items-center px-3 py-2 text-sm hover:bg-secondary transition-colors ${locale === lang.code ? 'bg-secondary text-primary' : 'text-foreground'
                      }`}
                    onClick={() => setShowLangMenu(false)}
                  >
                    <span className="mr-2 text-xs font-mono">{lang.code.toUpperCase()}</span>
                    {lang.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={t('toggle_theme')}
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
          >
            {t('get_started')}
          </Link>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Language Switcher */}
          <div className="relative">
            <button
              onClick={toggleLangMenu}
              className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors flex items-center"
              aria-label="Change Language"
            >
              <FiGlobe className="h-5 w-5 mr-1" />
              <span className="text-xs font-medium">{currentLang.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={pathname.replace(/^\/[a-z]{2}/, `/${lang.code}`)}
                    className={`flex items-center px-3 py-2 text-sm hover:bg-secondary transition-colors ${locale === lang.code ? 'bg-secondary text-primary' : 'text-foreground'
                      }`}
                    onClick={() => setShowLangMenu(false)}
                  >
                    <span className="mr-2 text-xs font-mono">{lang.code.toUpperCase()}</span>
                    {lang.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={t('toggle_theme')}
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-foreground"
            aria-label={t('toggle_menu')}
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.external ? item.path : `/${locale}${item.path}`}
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noopener noreferrer" : ""}
                className={`block px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                  }`}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/contact`}
              className="block px-4 py-2 mt-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
              onClick={toggleMenu}
            >
              {t('get_started')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
````

## File: src/lib/blog.ts
````typescript
// Enhanced blog library with i18n support
// File: src/lib/blog.ts

// Import English data as default
import blogPostsEn from '../data/blog-posts-en.json';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  category?: string;
  tags: string[];
  image?: string;
  readingTime: string;
  locale: string; // Added locale field
  seo: {
    title: string;
    description: string;
    keywords: string[] | string;
    ogImage?: string;
  };
  headings: {
    id: string;
    text: string;
    level: number;
  }[];
}

export interface PaginatedPosts {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const POSTS_PER_PAGE = 6; // Adjust as needed

// Cache for loaded blog data
const blogDataCache: Record<string, BlogPost[]> = {
  'en': blogPostsEn as BlogPost[]
};

// Get blog data for specific locale with fallback
async function getBlogData(locale: string): Promise<BlogPost[]> {
  // Return cached data if available
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }

  try {
    // Try to dynamically import locale-specific data
    let data: BlogPost[];

    switch (locale) {
      case 'fr':
        try {
          const frModule = await import('../data/blog-posts-fr.json');
          data = frModule.default as BlogPost[];
        } catch {
          console.warn(`French blog data not found, falling back to English`);
          data = blogPostsEn as BlogPost[];
        }
        break;
      default:
        data = blogPostsEn as BlogPost[];
        break;
    }

    // Cache the loaded data
    blogDataCache[locale] = data;
    return data;
  } catch {
    console.warn(`Could not load blog data for locale '${locale}', using English fallback`);
    return blogPostsEn as BlogPost[];
  }
}

// Synchronous version for when we need immediate data
function getBlogDataSync(locale: string): BlogPost[] {
  // Return cached data if available
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }

  // For initial load, always return English data
  console.warn(`Blog data for locale '${locale}' not cached, returning English data`);
  return blogPostsEn as BlogPost[];
}

// Get all blog posts for a specific locale
export function getAllPosts(locale: string = 'en'): BlogPost[] {
  return getBlogDataSync(locale);
}

// Async version for when you can use async/await
export async function getAllPostsAsync(locale: string = 'en'): Promise<BlogPost[]> {
  return await getBlogData(locale);
}

// Get paginated posts for a specific locale
export function getPaginatedPosts(page: number = 1, locale: string = 'en'): PaginatedPosts {
  const allPosts = getAllPosts(locale);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Async version of paginated posts
export async function getPaginatedPostsAsync(page: number = 1, locale: string = 'en'): Promise<PaginatedPosts> {
  const allPosts = await getAllPostsAsync(locale);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Get all unique tags from all posts for a specific locale
export function getAllTags(locale: string = 'en'): string[] {
  const posts = getAllPosts(locale);
  const allTags = posts.flatMap(post => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.sort();
}

// Get posts by tag for a specific locale
export function getPostsByTag(tagSlug: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.filter(post =>
    post.tags && post.tags.some(tag =>
      tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
    )
  );
}

// Get paginated posts by tag for a specific locale
export function getPaginatedPostsByTag(tagSlug: string, page: number = 1, locale: string = 'en'): PaginatedPosts {
  const allTagPosts = getPostsByTag(tagSlug, locale);
  const totalPosts = allTagPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allTagPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Get a single post by slug for a specific locale
export function getPostBySlug(slug: string, locale: string = 'en'): BlogPost | null {
  const posts = getAllPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts for a specific locale (for homepage, etc.)
export function getRecentPosts(count: number = 3, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.slice(0, count);
}

// Get tag display name from slug for a specific locale
export function getTagBySlug(tagSlug: string, locale: string = 'en'): string | null {
  const posts = getAllPosts(locale);
  for (const post of posts) {
    if (post.tags) {
      const tag = post.tags.find(tag =>
        tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
      );
      if (tag) return tag;
    }
  }
  return null;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Search posts by title, excerpt, or tags for a specific locale
export function searchPosts(query: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  const lowercaseQuery = query.toLowerCase();

  return posts.filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    (post.tags && post.tags.some(tag =>
      tag.toLowerCase().includes(lowercaseQuery)
    ))
  );
}

// Get all available locales that have blog data
export function getAvailableLocales(): string[] {
  return Object.keys(blogDataCache);
}

// Initialize blog data for a specific locale (call this in app startup if needed)
export async function initializeBlogData(locale: string): Promise<void> {
  await getBlogData(locale);
}
````

## File: next.config.ts
````typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common configuration
  trailingSlash: false,
  reactStrictMode: true,

  // Fixed image configuration - use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'mayorana.ch',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Remove problematic headers that might cause conflicts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Simplified redirects
  async redirects() {
    return [];
  },

  // Simplified rewrites
  async rewrites() {
    return [];
  },

  // Additional production optimizations
  poweredByHeader: false,
  compress: true,
};

export default withNextIntl(nextConfig);
````

## File: scripts/daily-publish.sh
````bash
#!/bin/bash
# Daily Publishing Script with i18n support
# File: scripts/daily-publish.sh
#
# This script runs daily at 9 AM to automatically publish queued content
# Now supports content/en and content/fr structure

set -e # Exit on any error

# Configuration with smart defaults
REPO_DIR=$(pwd)
LOG_FILE="/var/log/blog-publishing.log"
BACKUP_DIR="/tmp/blog-backup"
SITE_URL="https://mayorana.ch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling with cleanup
handle_error() {
  log "❌ ERROR: $1"

  # Send simple notification if webhook exists
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Blog auto-publish failed: '"$1"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi

  exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "content" ]; then
  handle_error "Not in mayorana project directory"
fi

# Main publishing logic
main() {
  log "🚀 Starting daily publishing check..."

  # Create backup (simple, no fancy setup needed)
  if [ -d "content" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r content/ "$BACKUP_DIR/content-$(date +%Y%m%d_%H%M%S)/" || log "⚠️ Backup failed (continuing)"
  fi

  # Pull latest changes (ignore errors if no remote)
  log "📥 Checking for new content..."
  git pull origin master 2>/dev/null || log "⚠️ Git pull failed (continuing)"

  # Check if we should publish today using our CLI
  log "🔍 Checking if we should publish today..."

  if ! node scripts/blog-cli.js status --quiet >/dev/null 2>&1; then
    log "⚠️ CLI not working, skipping publish"
    exit 0
  fi

  # Try to publish using our scheduling system
  log "📝 Attempting to publish today's article..."

  if node scripts/schedule-publish.js --publish 2>/dev/null; then
    log "✅ Article published successfully!"

    # Regenerate blog data and sitemap
    log "🔄 Regenerating blog data..."
    node scripts/generate-blog-data.js || handle_error "Blog data generation failed"

    log "🗺️ Regenerating sitemap..."
    node scripts/generate-sitemap.js || handle_error "Sitemap generation failed"

    # Commit the new content - updated for i18n structure
    log "📝 Committing published content..."
    git add content/en/blog/ content/fr/blog/ content/queue/ src/data/ public/sitemap.xml || log "⚠️ Git add failed (continuing)"

    # Get the published article name for commit message - check both locales
    PUBLISHED_ARTICLE=""
    if [ -d "content/en/blog" ]; then
      PUBLISHED_ARTICLE=$(ls content/en/blog/*.md 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "")
    fi
    if [ -z "$PUBLISHED_ARTICLE" ] && [ -d "content/fr/blog" ]; then
      PUBLISHED_ARTICLE=$(ls content/fr/blog/*.md 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "")
    fi
    if [ -z "$PUBLISHED_ARTICLE" ]; then
      PUBLISHED_ARTICLE="article"
    fi

    if git commit -m "Auto-publish: ${PUBLISHED_ARTICLE%.md} - $(date '+%Y-%m-%d %H:%M')" 2>/dev/null; then
      log "✅ Content committed to git"

      # Try to push (ignore failures in case of network issues)
      if git push origin master 2>/dev/null; then
        log "✅ Changes pushed to repository"
      else
        log "⚠️ Git push failed (continuing)"
      fi
    else
      log "⚠️ Git commit failed (continuing)"
    fi

    # Wait for file system to sync before building
    log "⏳ Waiting for file system to sync..."
    sleep 5

    # Build the site
    log "🏗️ Building site..."
    if ! /usr/local/bin/yarn build 2>&1 | tee -a "$LOG_FILE"; then
      handle_error "Build failed - check logs above"
    fi
    sleep 20

    # Restart PM2 if it's running
    if command -v pm2 >/dev/null 2>&1; then
      log "🔄 Restarting application..."
      pm2 restart mayorana 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || log "⚠️ PM2 restart failed"
    fi

    # Wait a moment for restart
    sleep 5

    # Basic health check - test both locales
    log "🔍 Health check..."
    if curl -sf "$SITE_URL/en/blog" >/dev/null 2>&1; then
      log "✅ English site is responding"
    else
      log "⚠️ English site health check failed"
    fi

    if curl -sf "$SITE_URL/fr/blog" >/dev/null 2>&1; then
      log "✅ French site is responding"
    else
      log "⚠️ French site health check failed"
    fi

    # Ping search engines (ignore failures)
    log "🔔 Notifying search engines..."
    curl -s "https://www.google.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
    curl -s "https://www.bing.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true

    # Success notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
      curl -s -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ Daily blog published successfully! 🎉"}' \
        "$SLACK_WEBHOOK_URL" || true
    fi

    log "🎉 Daily publishing completed successfully!"

  else
    log "📭 No content to publish today"
  fi

  # Cleanup old backups (keep last 3 days)
  find "$BACKUP_DIR" -name "content-*" -type d -mtime +3 -exec rm -rf {} + 2>/dev/null || true

  log "✅ Daily publishing check completed"
}

# Emergency controls check
if [ -f ".publishing-paused" ]; then
  log "⏸️ Publishing is paused (.publishing-paused file exists)"
  exit 0
fi

if [ -f ".skip-today" ]; then
  log "⏭️ Skipping today (.skip-today file exists)"
  rm -f ".skip-today" # Auto-remove so it only skips once
  exit 0
fi

# Run main function
main "$@"
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mayorana - Rust, AI, and API Solutions",
  description: "Empowering Innovation with Rust, AI, and API Solutions",
};

// MINIMAL root layout - just HTML structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
````

## File: package.json
````json
{
  "name": "mayorana",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/generate-blog-data.js && next dev -p 3006",
    "prebuild": "node scripts/generate-blog-data.js",
    "build": "next build && node scripts/generate-sitemap.js",
    "postbuild": "echo '✅ Build completed - sitemap generated'",
    "start": "next start -p 3006",
    "lint": "next lint",
    "deploy-fix": "chmod +x scripts/deploy-fix.sh && ./scripts/deploy-fix.sh",
    "sitemap": "node scripts/generate-sitemap.js",
    "blog-data": "node scripts/generate-blog-data.js"
  },
  "dependencies": {
    "@types/js-yaml": "^4.0.9",
    "framer-motion": "^12.10.1",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0",
    "marked": "^15.0.11",
    "next": "15.3.1",
    "next-intl": "^4.3.4",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.2",
    "react-icons": "^5.5.0",
    "reading-time": "^1.5.0",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "remark-prism": "^1.3.6",
    "slugify": "^1.6.6",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "postcss": "^8.5.3",
    "tailwindcss": "3.4.1",
    "typescript": "^5"
  }
}
````
