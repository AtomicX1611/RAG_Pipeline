/**
 * Documents API service — manage user's indexed documents per workspace.
 */
import api from './api';

/**
 * Get document stats for current user, scoped to a workspace.
 * @param {string} workspaceId
 * @returns {Promise<{ totalChunks: number, hasDocuments: boolean, message: string }>}
 */
export async function getDocumentStats(workspaceId = 'default') {
  const { data } = await api.get('/api/documents', {
    params: { workspaceId },
  });
  return data;
}

/**
 * Delete all documents for the current user in a specific workspace.
 * @param {string} workspaceId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteAllDocuments(workspaceId = 'default') {
  const { data } = await api.delete('/api/documents', {
    params: { workspaceId },
  });
  return data;
}
