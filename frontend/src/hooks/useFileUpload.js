import { useCallback, useState } from 'react';
import { useApp } from '../store/AppContext';
import { uploadFiles } from '../services/uploadService';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from '../utils/constants';

/**
 * Hook for file upload logic — validation, adding, removing, and uploading.
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

  /** Upload all pending files */
  const upload = useCallback(async () => {
    const pending = uploadedFiles.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await uploadFiles(
        pending.map((f) => f.file),
        chunkingStrategy,
        (pct) => setUploadProgress(pct),
      );
      clearFiles();
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [uploadedFiles, chunkingStrategy, clearFiles, setUploadProgress]);

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
