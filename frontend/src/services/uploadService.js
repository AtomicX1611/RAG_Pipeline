/**
 * File upload API service.
 * Currently returns mock data; swap implementations when backend is ready.
 */
import api from './api';

const USE_MOCK = true;

/**
 * Upload files with a specified chunking strategy.
 * @param {File[]} files
 * @param {string} chunkingStrategy
 * @param {function} onProgress - progress callback (0–100)
 * @returns {Promise<{ success: boolean, filesProcessed: number }>}
 */
export async function uploadFiles(files, chunkingStrategy, onProgress) {
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
