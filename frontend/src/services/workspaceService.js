/**
 * Workspace API service — all workspace-related backend communication.
 */
import api from './api';

export const workspaceService = {
  /** Fetch all workspaces for the current user. */
  getWorkspaces: async () => {
    const { data } = await api.get('/api/workspaces');
    return data;
  },

  /** Create a new workspace. */
  createWorkspace: async (name, description = '', color = 'violet') => {
    const { data } = await api.post('/api/workspaces', { name, description, color });
    return data;
  },

  /** Rename / update a workspace. */
  updateWorkspace: async (id, name, description = '') => {
    const { data } = await api.patch(`/api/workspaces/${id}`, { name, description });
    return data;
  },

  /** Delete a workspace (and all its documents). */
  deleteWorkspace: async (id) => {
    const { data } = await api.delete(`/api/workspaces/${id}`);
    return data;
  },
};