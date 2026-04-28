import { useCallback, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useWorkspace } from '../store/WorkspaceContext';
import { uploadFiles } from '../services/uploadService';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from '../utils/constants';

/**
 * Hook for file upload logic — validation, adding, removing, and uploading.
 * Scopes the upload to the currently active workspace.
 */
export function useFileUpload() {
  const {
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadProgress,
    setUploadProgress,
    chunkingStrategy,
  } = useApp();

  const { activeWorkspace } = useWorkspace();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /** Validate and add files */
  const handleFilesSelected = useCallback(
    (fileList) => {
      setError(null);
      const validFiles = [];

      for (const file of Array.from(fileList)) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const accepted = Object.values(ACCEPTED_FILE_TYPES).flat();

        if (!accepted.includes(ext)) {
          setError(`"${file.name}" is not a supported file type. Use PDF or TXT.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setError(`"${file.name}" exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    },
    [addFiles],
  );

  /** Upload all pending files into the active workspace */
  const upload = useCallback(async () => {
    const pending = uploadedFiles.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    const workspaceId = activeWorkspace?.id || 'default';

    setUploading(true);
    setError(null);

    try {
      await uploadFiles(
        pending.map((f) => f.file),
        chunkingStrategy,
        (pct) => setUploadProgress(pct),
        workspaceId,
      );
      clearFiles();
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [uploadedFiles, chunkingStrategy, clearFiles, setUploadProgress, activeWorkspace]);

  return {
    uploadedFiles,
    uploading,
    uploadProgress,
    error,
    handleFilesSelected,
    removeFile,
    clearFiles,
    upload,
  };
}
