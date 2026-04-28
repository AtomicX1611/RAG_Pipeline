/**
 * Documents API service — manage user's indexed documents.
 */
import api from './api';

/**
 * Get document stats for current user.
 * @returns {Promise<{ totalChunks: number, hasDocuments: boolean, message: string }>}
 */
export async function getDocumentStats() {
  const { data } = await api.get('/api/documents');
  return data;
}

/**
 * Delete all documents for the current user.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteAllDocuments() {
  const { data } = await api.delete('/api/documents');
  return data;
}
