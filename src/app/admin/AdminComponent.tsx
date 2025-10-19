// File: src/app/admin/AdminComponent.tsx
import React, { useEffect, useCallback } from 'react';
import { useAdminState, useFileOperations } from './hooks';
import FileTree from './components/FileTree';
import AdminHeader from './components/AdminHeader';
import DualEditor from './components/DualEditor';

export default function AdminComponent() {
  const {
    state,
    updateState,
    setMessage,
    setLoading,
    setSaving,
    setEnFile,
    setFrFile,
    updateEnContent,
    updateFrContent,
  } = useAdminState();

  const { loadTree, loadFile, saveFile } = useFileOperations();

  // Load file tree on component mount
  useEffect(() => {
    const initializeFileTree = async () => {
      setLoading(true);
      try {
        const authKey = sessionStorage.getItem('admin-key');
        if (!authKey) {
          throw new Error('No authentication key found');
        }

        const result = await loadTree();
        if (result.success) {
          updateState({ treeData: result.data });
          setMessage('File tree loaded');
        } else {
          setMessage(result.error || 'Failed to load file tree');
        }
      } catch (error) {
        setMessage('Error loading file tree');
        console.error('Error:', error);
      }
      setLoading(false);
    };

    initializeFileTree();
  }, [loadTree, setLoading, setMessage, updateState]);

  const handleSaveFile = useCallback(async (language: 'en' | 'fr', isAutoSave: boolean = false) => {
    const fileToSave = language === 'en' ? state.enFile : state.frFile;
    if (!fileToSave) return;

    setSaving(true);
    try {
      const result = await saveFile(language, fileToSave);
      if (result.success) {
        // Update the original content to mark as saved
        if (language === 'en') {
          setEnFile({ ...fileToSave, originalContent: fileToSave.content });
        } else {
          setFrFile({ ...fileToSave, originalContent: fileToSave.content });
        }

        const timestamp = new Date().toLocaleTimeString();
        updateState({ lastSaved: timestamp });
        const langDisplay = language === 'en' ? 'EN' : 'FR';
        setMessage(isAutoSave ? `Auto-saved ${langDisplay} at ${timestamp}` : `Saved ${langDisplay}: ${fileToSave.path.split('/').pop()}`);
      } else {
        setMessage(result.error || `Failed to save ${language.toUpperCase()} file`);
      }
    } catch (error) {
      setMessage(`Error saving ${language.toUpperCase()} file`);
      console.error('Error:', error);
    }
    setSaving(false);
  }, [state.enFile, state.frFile, saveFile, setSaving, setEnFile, setFrFile, updateState, setMessage]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!state.hasChanges) return;

    const handleAutoSave = async () => {
      const enHasChanges = state.enFile && state.enFile.content !== state.enFile.originalContent;
      const frHasChanges = state.frFile && state.frFile.content !== state.frFile.originalContent;

      if (enHasChanges && state.enFile) {
        await handleSaveFile('en', true);
      }

      if (frHasChanges && state.frFile) {
        await handleSaveFile('fr', true);
      }
    };

    const autoSaveInterval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [state.hasChanges, state.enFile, state.frFile, handleSaveFile]);

  const handleLoadFileTree = useCallback(async () => {
    setLoading(true);
    const result = await loadTree();
    if (result.success) {
      updateState({ treeData: result.data });
      setMessage('File tree loaded');
    } else {
      setMessage(result.error || 'Failed to load file tree');
    }
    setLoading(false);
  }, [loadTree, setLoading, updateState, setMessage]);

  const handleSelectFile = useCallback(async (filePath: string) => {
    setLoading(true);
    const result = await loadFile(filePath);

    if (result.success) {
      setEnFile(result.enFile || null);
      setFrFile(result.frFile || null);
      updateState({
        selectedFile: filePath,
        lastSaved: null
      });
      setMessage(`Loaded: ${result.fileName}`);
    } else {
      setMessage(result.error || 'Failed to load file');
    }
    setLoading(false);
  }, [loadFile, setLoading, setEnFile, setFrFile, updateState, setMessage]);

  const handleSaveAll = useCallback(() => {
    const enHasChanges = state.enFile && state.enFile.content !== state.enFile.originalContent;
    const frHasChanges = state.frFile && state.frFile.content !== state.frFile.originalContent;

    if (enHasChanges) handleSaveFile('en');
    if (frHasChanges) handleSaveFile('fr');
  }, [state.enFile, state.frFile, handleSaveFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, language?: 'en' | 'fr') => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (language) {
        // Save specific language
        const fileToSave = language === 'en' ? state.enFile : state.frFile;
        if (fileToSave && fileToSave.content !== fileToSave.originalContent) {
          handleSaveFile(language);
        }
      } else {
        // Save both if they have changes
        handleSaveAll();
      }
    }
  }, [state.enFile, state.frFile, handleSaveFile, handleSaveAll]);

  return (
    <div className="h-screen flex bg-background">
      <FileTree
        treeData={state.treeData}
        selectedFile={state.selectedFile}
        isLoading={state.isLoading}
        onLoadFileTree={handleLoadFileTree}
        onSelectFile={handleSelectFile}
      />

      <div className="flex-1 flex flex-col">
        <AdminHeader
          selectedFile={state.selectedFile}
          hasChanges={state.hasChanges}
          isSaving={state.isSaving}
          message={state.message}
          lastSaved={state.lastSaved}
          onSaveAll={handleSaveAll}
        />

        <div className="flex-1 p-6">
          <DualEditor
            selectedFile={state.selectedFile}
            enFile={state.enFile}
            frFile={state.frFile}
            hasChanges={state.hasChanges}
            isSaving={state.isSaving}
            onEnContentChange={updateEnContent}
            onFrContentChange={updateFrContent}
            onSaveFile={handleSaveFile}
            onSaveAll={handleSaveAll}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
