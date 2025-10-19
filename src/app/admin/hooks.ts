// File: src/app/admin/hooks.ts
import { useState, useEffect, useCallback } from 'react';
import { AdminState, LanguageFile } from './types';
import { loadFileTree, loadSingleFile, saveFileToServer, findTranslationFile } from './api';

export const useAdminState = () => {
  const [state, setState] = useState<AdminState>({
    treeData: [],
    selectedFile: null,
    enFile: null,
    frFile: null,
    isLoading: false,
    isSaving: false,
    message: '',
    hasChanges: false,
    lastSaved: null,
  });

  // Track changes for both files
  useEffect(() => {
    const enHasChanges = state.enFile && state.enFile.content !== state.enFile.originalContent;
    const frHasChanges = state.frFile && state.frFile.content !== state.frFile.originalContent;
    setState(prev => ({ ...prev, hasChanges: Boolean(enHasChanges || frHasChanges) }));
  }, [state.enFile, state.frFile]);

  const updateState = useCallback((updates: Partial<AdminState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setMessage = useCallback((message: string) => {
    updateState({ message });
  }, [updateState]);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  const setSaving = useCallback((isSaving: boolean) => {
    updateState({ isSaving });
  }, [updateState]);

  const setEnFile = useCallback((enFile: LanguageFile | null) => {
    updateState({ enFile });
  }, [updateState]);

  const setFrFile = useCallback((frFile: LanguageFile | null) => {
    updateState({ frFile });
  }, [updateState]);

  const updateEnContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      enFile: prev.enFile ? { ...prev.enFile, content } : null
    }));
  }, []);

  const updateFrContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      frFile: prev.frFile ? { ...prev.frFile, content } : null
    }));
  }, []);

  return {
    state,
    updateState,
    setMessage,
    setLoading,
    setSaving,
    setEnFile,
    setFrFile,
    updateEnContent,
    updateFrContent,
  };
};

export const useFileOperations = () => {
  const loadTree = useCallback(async () => {
    try {
      const data = await loadFileTree();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error loading file tree'
      };
    }
  }, []);

  const loadFile = useCallback(async (filePath: string) => {
    try {
      // Load the selected file
      const data = await loadSingleFile(filePath);
      const isEnglish = filePath.includes('en/');

      const primaryFile: LanguageFile = {
        path: filePath,
        content: data.content,
        originalContent: data.content
      };

      // Try to find and load the translation
      const translationPath = await findTranslationFile(filePath);
      let translationFile: LanguageFile | null = null;

      if (translationPath) {
        try {
          const translationData = await loadSingleFile(translationPath);
          translationFile = {
            path: translationPath,
            content: translationData.content,
            originalContent: translationData.content
          };
        } catch {
          // Translation file couldn't be loaded
        }
      }

      return {
        success: true,
        enFile: isEnglish ? primaryFile : translationFile,
        frFile: isEnglish ? translationFile : primaryFile,
        fileName: filePath.split('/').pop() || ''
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error loading file'
      };
    }
  }, []);

  const saveFile = useCallback(async (language: 'en' | 'fr', file: LanguageFile) => {
    try {
      await saveFileToServer(file.path, file.content);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : `Error saving ${language.toUpperCase()} file`
      };
    }
  }, []);

  return {
    loadTree,
    loadFile,
    saveFile,
  };
};
