// File: src/app/secret-admin-blog-editor-xyz/AdminComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Tree } from 'react-arborist';
// Import icons individually to avoid barrel optimization issues
import { FiFile } from 'react-icons/fi';
import { FiFolder } from 'react-icons/fi';
import { TfiFolder } from 'react-icons/tfi';
import { FiSave } from 'react-icons/fi';
import { FiRefreshCw } from 'react-icons/fi';
import { FiEdit3 } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { FiAlertCircle } from 'react-icons/fi';

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

export default function AdminComponent() {
  const [treeData, setTreeData] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [treeDimensions, setTreeDimensions] = useState({ width: 320, height: 600 });

  // Load file tree on component mount
  useEffect(() => {
    const initializeFileTree = async () => {
      setIsLoading(true);
      try {
        const authKey = sessionStorage.getItem('admin-key');
        if (!authKey) {
          throw new Error('No authentication key found');
        }
        
        const response = await fetch(`/api/admin/files?key=${encodeURIComponent(authKey)}`);
        if (response.ok) {
          const data = await response.json();
          setTreeData(data);
          setMessage('File tree loaded');
        } else if (response.status === 401) {
          setMessage('Authentication failed. Please refresh and login again.');
        } else {
          setMessage('Failed to load file tree');
        }
      } catch (error) {
        setMessage('Error loading file tree');
        console.error('Error:', error);
      }
      setIsLoading(false);
    };

    initializeFileTree();
  }, []); // Empty dependency array is correct here - only run on mount

  // Track changes
  useEffect(() => {
    setHasChanges(fileContent !== originalContent && selectedFile !== null);
  }, [fileContent, originalContent, selectedFile]);

  // Update tree dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (treeContainerRef.current) {
        const rect = treeContainerRef.current.getBoundingClientRect();
        setTreeDimensions({
          width: rect.width || 320,
          height: rect.height || 600
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!hasChanges || !selectedFile) return;

    const handleAutoSave = async () => {
      if (!selectedFile || !hasChanges) return;
      
      setSaving(true);
      try {
        const authKey = sessionStorage.getItem('admin-key');
        if (!authKey) {
          setMessage('Authentication failed. Please refresh and login again.');
          setSaving(false);
          return;
        }
        
        const response = await fetch(`/api/admin/files?key=${encodeURIComponent(authKey)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: selectedFile,
            content: fileContent,
          }),
        });

        if (response.ok) {
          setOriginalContent(fileContent);
          const timestamp = new Date().toLocaleTimeString();
          setLastSaved(timestamp);
          setMessage(`🔄 Auto-saved at ${timestamp}`);
        } else if (response.status === 401) {
          setMessage('Authentication failed. Please refresh and login again.');
        } else {
          setMessage('❌ Auto-save failed');
        }
      } catch (error) {
        setMessage('❌ Auto-save error');
        console.error('Auto-save error:', error);
      }
      setSaving(false);
    };

    const autoSaveInterval = setInterval(handleAutoSave, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, selectedFile, fileContent]); // Include fileContent to capture current content

  // Helper function to make authenticated API calls
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const authKey = sessionStorage.getItem('admin-key');
    if (!authKey) {
      throw new Error('No authentication key found');
    }
    
    const separator = url.includes('?') ? '&' : '?';
    const authenticatedUrl = `${url}${separator}key=${encodeURIComponent(authKey)}`;
    
    return fetch(authenticatedUrl, options);
  };

  const loadFileTree = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/admin/files');
      if (response.ok) {
        const data = await response.json();
        setTreeData(data);
        setMessage('File tree loaded');
      } else if (response.status === 401) {
        setMessage('Authentication failed. Please refresh and login again.');
      } else {
        setMessage('Failed to load file tree');
      }
    } catch (error) {
      setMessage('Error loading file tree');
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const loadFile = async (filePath: string) => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/admin/files/${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        setOriginalContent(data.content);
        setSelectedFile(filePath);
        setMessage(`Loaded: ${filePath}`);
        setLastSaved(null);
      } else if (response.status === 401) {
        setMessage('Authentication failed. Please refresh and login again.');
      } else {
        setMessage('Failed to load file');
      }
    } catch (error) {
      setMessage('Error loading file');
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const saveFile = async (isAutoSave: boolean = false) => {
    if (!selectedFile) return;
    
    setSaving(true);
    try {
      const response = await authenticatedFetch('/api/admin/files', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: selectedFile,
          content: fileContent,
        }),
      });

      if (response.ok) {
        setOriginalContent(fileContent);
        const timestamp = new Date().toLocaleTimeString();
        setLastSaved(timestamp);
        setMessage(isAutoSave ? `🔄 Auto-saved at ${timestamp}` : `✅ Saved: ${selectedFile}`);
      } else if (response.status === 401) {
        setMessage('Authentication failed. Please refresh and login again.');
      } else {
        setMessage('❌ Failed to save file');
      }
    } catch (error) {
      setMessage('❌ Error saving file');
      console.error('Error:', error);
    }
    setSaving(false);
  };

  // Tree node component with proper typing for react-arborist
  const Node = ({ node, style, dragHandle }: {
    node: {
      data: FileNode;
      isOpen: boolean;
      toggle: () => void;
    };
    style: React.CSSProperties;
    dragHandle?: (el: HTMLDivElement | null) => void;
  }) => {
    const isSelected = selectedFile === node.data.path;
    const isFile = node.data.type === 'file';
    const isMdFile = isFile && node.data.name.endsWith('.md');

    return (
      <div
        ref={dragHandle}
        style={style}
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-secondary/50 rounded-sm transition-colors ${
          isSelected ? 'bg-primary/20 text-primary' : ''
        }`}
        onClick={() => {
          if (isMdFile) {
            loadFile(node.data.path);
          } else if (!isFile) {
            node.toggle();
          }
        }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {!isFile ? (
            node.isOpen ? (
              <TfiFolder className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            ) : (
              <FiFolder className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            )
          ) : isMdFile ? (
            <FiEdit3 className="h-4 w-4 mr-2 flex-shrink-0 text-green-500" />
          ) : (
            <FiFile className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-sm">
            {node.data.name}
          </span>
        </div>
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (hasChanges) {
        saveFile();
      }
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - File Tree */}
      <div className="w-80 bg-secondary/30 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Blog Files</h2>
            <button
              onClick={loadFileTree}
              disabled={isLoading}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Refresh file tree"
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on .md files to edit them
          </p>
        </div>

        <div className="flex-1 overflow-hidden" ref={treeContainerRef}>
          {treeData.length > 0 ? (
            <Tree
              data={treeData}
              openByDefault={false}
              width={treeDimensions.width}
              height={treeDimensions.height}
              indent={24}
              rowHeight={32}
              overscanCount={1}
              padding={16}
              searchTerm=""
              searchMatch={() => false}
              disableEdit={true}
              disableDrag={true}
              disableDrop={true}
            >
              {Node}
            </Tree>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {isLoading ? 'Loading files...' : 'No files found'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-secondary/30 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Blog Editor</h1>
            {selectedFile && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>•</span>
                <span className="font-mono truncate max-w-xs">{selectedFile}</span>
                {hasChanges && (
                  <span className="text-yellow-500">• Modified</span>
                )}
                {lastSaved && (
                  <span className="text-green-500 flex items-center">
                    <FiClock className="h-3 w-3 mr-1" />
                    {lastSaved}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {message && (
              <span className="text-sm text-muted-foreground mr-4 max-w-xs truncate">
                {message}
              </span>
            )}
            <button
              onClick={() => saveFile(false)}
              disabled={!hasChanges || isSaving || !selectedFile}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSave className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6">
          {selectedFile ? (
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

              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full p-4 border border-border rounded-lg bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Start editing your markdown content here..."
                spellCheck={false}
              />

              <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Lines: {fileContent.split('\n').length}</span>
                  <span>Characters: {fileContent.length}</span>
                  <span>Words: {fileContent.split(/\s+/).filter(w => w.length > 0).length}</span>
                </div>
                <div>
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
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FiEdit3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No file selected</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a .md file from the sidebar to start editing. The editor supports:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Auto-save every 30 seconds</li>
                  <li>• Manual save with Ctrl+S</li>
                  <li>• Real-time change detection</li>
                  <li>• Automatic backups</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
