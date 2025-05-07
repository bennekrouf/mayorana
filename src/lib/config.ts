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
