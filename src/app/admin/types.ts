// File: src/app/admin/types.ts
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
  lastModified?: string; // ISO date string
}

export interface LanguageFile {
  path: string;
  content: string;
  originalContent: string;
}

export interface AdminState {
  treeData: FileNode[];
  selectedFile: string | null;
  enFile: LanguageFile | null;
  frFile: LanguageFile | null;
  isLoading: boolean;
  isSaving: boolean;
  message: string;
  hasChanges: boolean;
  lastSaved: string | null;
}
