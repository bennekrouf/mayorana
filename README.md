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
