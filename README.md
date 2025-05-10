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
```

## License

MIT
