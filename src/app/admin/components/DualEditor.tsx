// File: src/app/admin/components/DualEditor.tsx
import React from 'react';
import { FiEdit3, FiAlertCircle, FiSave } from 'react-icons/fi';
import { LanguageFile } from '../types';

interface DualEditorProps {
  selectedFile: string | null;
  enFile: LanguageFile | null;
  frFile: LanguageFile | null;
  hasChanges: boolean;
  isSaving: boolean;
  onEnContentChange: (content: string) => void;
  onFrContentChange: (content: string) => void;
  onSaveFile: (language: 'en' | 'fr') => void;
  onSaveAll: () => void;
  onKeyDown: (e: React.KeyboardEvent, language?: 'en' | 'fr') => void;
}

const DualEditor: React.FC<DualEditorProps> = ({
  selectedFile,
  enFile,
  frFile,
  hasChanges,
  isSaving,
  onEnContentChange,
  onFrContentChange,
  onSaveFile,
  onSaveAll,
  onKeyDown
}) => {
  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FiEdit3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No file selected</h3>
          <p className="text-muted-foreground max-w-sm">
            Select a .md file from the sidebar to start editing. The editor supports:
          </p>
          <ul className="text-sm text-muted-foreground mt-4 space-y-1">
            <li>• Side-by-side EN/FR editing</li>
            <li>• Auto-translation detection</li>
            <li>• Independent save for each language</li>
            <li>• Auto-save every 30 seconds</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">
          Editing: {selectedFile.split('/').pop()}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Use Ctrl+S to save • Auto-saves every 30 seconds
          </p>
          {hasChanges && (
            <div className="flex items-center text-sm text-yellow-500">
              <FiAlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
        </div>
      </div>

      {/* Dual Language Editor */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* English Editor */}
        <div className="flex flex-col border rounded-lg">
          <div className="bg-secondary p-3 border-b flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-blue-600">🇬🇧 English</span>
              {enFile && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({enFile.path.split('/').slice(0, -1).join('/')})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {enFile && enFile.content !== enFile.originalContent && (
                <span className="text-xs text-yellow-500">Modified</span>
              )}
              <button
                onClick={() => onSaveFile('en')}
                disabled={!enFile || enFile.content === enFile.originalContent || isSaving}
                className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save EN
              </button>
            </div>
          </div>
          {enFile ? (
            <textarea
              value={enFile.content}
              onChange={(e) => onEnContentChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, 'en')}
              className="flex-1 w-full p-4 border-0 bg-background font-mono text-sm resize-none focus:outline-none focus:ring-0"
              placeholder="English content..."
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FiEdit3 className="h-8 w-8 mx-auto mb-2" />
                <p>No English version found</p>
              </div>
            </div>
          )}
        </div>

        {/* French Editor */}
        <div className="flex flex-col border rounded-lg">
          <div className="bg-secondary p-3 border-b flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-red-600">🇫🇷 Français</span>
              {frFile && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({frFile.path.split('/').slice(0, -1).join('/')})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {frFile && frFile.content !== frFile.originalContent && (
                <span className="text-xs text-yellow-500">Modified</span>
              )}
              <button
                onClick={() => onSaveFile('fr')}
                disabled={!frFile || frFile.content === frFile.originalContent || isSaving}
                className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save FR
              </button>
            </div>
          </div>
          {frFile ? (
            <textarea
              value={frFile.content}
              onChange={(e) => onFrContentChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, 'fr')}
              className="flex-1 w-full p-4 border-0 bg-background font-mono text-sm resize-none focus:outline-none focus:ring-0"
              placeholder="French content..."
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FiEdit3 className="h-8 w-8 mx-auto mb-2" />
                <p>No French translation found</p>
                <p className="text-xs mt-1">Translation needed for this post</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center space-x-6">
          {enFile && (
            <div className="flex items-center space-x-4">
              <span className="text-blue-600">EN:</span>
              <span>Lines: {enFile.content.split('\n').length}</span>
              <span>Chars: {enFile.content.length}</span>
              <span>Words: {enFile.content.split(/\s+/).filter(w => w.length > 0).length}</span>
            </div>
          )}
          {frFile && (
            <div className="flex items-center space-x-4">
              <span className="text-red-600">FR:</span>
              <span>Lines: {frFile.content.split('\n').length}</span>
              <span>Chars: {frFile.content.length}</span>
              <span>Words: {frFile.content.split(/\s+/).filter(w => w.length > 0).length}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {hasChanges ? (
            <span className="text-yellow-500 flex items-center">
              <FiAlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </span>
          ) : (
            <span className="text-green-500 flex items-center">
              <FiSave className="h-4 w-4 mr-1" />
              All changes saved
            </span>
          )}
          <button
            onClick={onSaveAll}
            disabled={!hasChanges || isSaving}
            className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  );
};

export default DualEditor;
