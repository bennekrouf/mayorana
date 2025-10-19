// File: src/app/admin/api.ts
import { FileNode } from './types';

// Helper function to make authenticated API calls
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const authKey = sessionStorage.getItem('admin-key');
  if (!authKey) {
    throw new Error('No authentication key found');
  }

  const separator = url.includes('?') ? '&' : '?';
  const authenticatedUrl = `${url}${separator}key=${encodeURIComponent(authKey)}`;

  return fetch(authenticatedUrl, options);
};

// Load file tree
export const loadFileTree = async (): Promise<FileNode[]> => {
  const response = await authenticatedFetch('/api/admin/files');
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please refresh and login again.');
    }
    throw new Error('Failed to load file tree');
  }
  return response.json();
};

// Load a single file
export const loadSingleFile = async (filePath: string): Promise<{ content: string }> => {
  const response = await authenticatedFetch(`/api/admin/files/${encodeURIComponent(filePath)}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please refresh and login again.');
    }
    throw new Error('Failed to load file');
  }
  return response.json();
};

// Save a file
export const saveFileToServer = async (path: string, content: string): Promise<void> => {
  const response = await authenticatedFetch('/api/admin/files', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, content }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please refresh and login again.');
    }
    throw new Error('Failed to save file');
  }
};

// Find translation file
export const findTranslationFile = async (originalPath: string): Promise<string | null> => {
  const authKey = sessionStorage.getItem('admin-key');
  if (!authKey) return null;

  const fileName = originalPath.split('/').pop();
  if (!fileName) return null;

  // Determine if original is EN or FR and target language
  const isEnglish = originalPath.includes('en/');
  const targetLang = isEnglish ? 'fr' : 'en';

  // Search in all possible locations: blog, queue, drafts
  const searchPaths = [
    `${targetLang}/blog/${fileName}`,
    `${targetLang}/queue/${fileName}`,
    `${targetLang}/drafts/${fileName}`
  ];

  for (const searchPath of searchPaths) {
    try {
      const response = await fetch(`/api/admin/files/${encodeURIComponent(searchPath)}?key=${encodeURIComponent(authKey)}`);
      if (response.ok) {
        return searchPath;
      }
    } catch {
      // Continue searching
    }
  }

  return null;
};
