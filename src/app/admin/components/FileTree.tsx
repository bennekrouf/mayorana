// File: src/app/admin/components/FileTree.tsx - Fixed sorting for oldest first
import React, { useRef, useEffect, useState } from 'react';
import { Tree } from 'react-arborist';
import { FiFile, FiFolder, FiRefreshCw, FiEdit3 } from 'react-icons/fi';
import { TfiFolder } from 'react-icons/tfi';
import { FileNode } from '../types';

interface FileTreeProps {
  treeData: FileNode[];
  selectedFile: string | null;
  isLoading: boolean;
  onLoadFileTree: () => void;
  onSelectFile: (filePath: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  treeData,
  selectedFile,
  isLoading,
  onLoadFileTree,
  onSelectFile
}) => {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [treeDimensions, setTreeDimensions] = useState({ width: 320, height: 600 });

  // Sort tree data by modification date (files only, keep folders at top)
  const sortTreeData = (nodes: FileNode[]): FileNode[] => {
    return nodes.map(node => {
      if (node.type === 'folder' && node.children) {
        // For folders, recursively sort children and keep folders at top
        const sortedChildren = sortTreeData(node.children);
        const folders = sortedChildren.filter(child => child.type === 'folder');
        const files = sortedChildren
          .filter(child => child.type === 'file')
          .sort((a, b) => {
            // Sort files by last modification date (oldest first for review)
            if (!a.lastModified && !b.lastModified) return 0;
            if (!a.lastModified) return 1;
            if (!b.lastModified) return -1;
            return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          });

        return {
          ...node,
          children: [...folders, ...files]
        };
      }
      return node;
    });
  };

  const sortedTreeData = sortTreeData(treeData);

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

  // Tree node component
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

    // Format the last modified date for display
    const formatModifiedDate = (dateString?: string) => {
      if (!dateString) return '';

      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        // Less than 1 hour ago
        const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${minutes}m`;
      } else if (diffInHours < 24) {
        // Less than 24h ago - show hours
        return `${Math.floor(diffInHours)}h`;
      } else if (diffInHours < 24 * 7) {
        // Less than a week ago - show days
        const days = Math.floor(diffInHours / 24);
        return `${days}d`;
      } else {
        // Older - show date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    };

    return (
      <div
        ref={dragHandle}
        style={style}
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-secondary/50 rounded-sm transition-colors ${isSelected ? 'bg-primary/20 text-primary' : ''
          }`}
        onClick={() => {
          if (isMdFile) {
            onSelectFile(node.data.path);
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
          <span className="truncate text-sm flex-1">
            {node.data.name}
          </span>
          {isFile && node.data.lastModified && (
            <span className="text-xs text-muted-foreground/60 ml-2 flex-shrink-0">
              {formatModifiedDate(node.data.lastModified)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-secondary/30 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Blog Files</h2>
          <button
            onClick={onLoadFileTree}
            disabled={isLoading}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh file tree"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Files sorted by last modified (oldest first for review)
        </p>
      </div>

      <div className="flex-1 overflow-hidden pl-2" ref={treeContainerRef}>
        {sortedTreeData.length > 0 ? (
          <Tree
            data={sortedTreeData}
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
  );
};

export default FileTree;
