/**
 * File upload API service.
 */
import api from './api';

const USE_MOCK = false;

/**
 * Upload files with a specified chunking strategy, scoped to a workspace.
 * @param {File[]} files
 * @param {string} chunkingStrategy
 * @param {function} onProgress - progress callback (0–100)
 * @param {string} workspaceId - workspace to upload into
 * @returns {Promise<{ success: boolean, filesProcessed: number }>}
 */
export async function uploadFiles(files, chunkingStrategy, onProgress, workspaceId = 'default') {
  if (USE_MOCK) {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await delay(150);
      onProgress?.(i);
    }
    return { success: true, filesProcessed: files.length };
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('chunking_strategy', chunkingStrategy);
  formData.append('workspace_id', workspaceId);

  const { data } = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = Math.round((e.loaded * 100) / (e.total || 1));
      onProgress?.(pct);
    },
  });
  return data;
}

/* ---------- helpers ---------- */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

