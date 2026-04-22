import { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_CHUNKING_STRATEGY } from '../utils/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chunkingStrategy, setChunkingStrategy] = useState(DEFAULT_CHUNKING_STRATEGY);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null); // null | 0–100
  const [showUploadZone, setShowUploadZone] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const addFiles = useCallback((files) => {
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'pending', // pending | uploading | done | error
      })),
    ]);
  }, []);

  const removeFile = useCallback((fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        chunkingStrategy,
        setChunkingStrategy,
        uploadedFiles,
        addFiles,
        removeFile,
        clearFiles,
        uploadProgress,
        setUploadProgress,
        showUploadZone,
        setShowUploadZone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
