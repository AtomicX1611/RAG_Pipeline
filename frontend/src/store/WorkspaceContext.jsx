import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { workspaceService } from '../services/workspaceService';

export const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0) {
        // Keep the active workspace if it still exists, otherwise select the first one
        setActiveWorkspace((prev) => {
          const stillExists = prev && data.find((w) => w.id === prev.id);
          return stillExists ? data.find((w) => w.id === prev.id) : data[0];
        });
      } else {
        setActiveWorkspace(null);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
    }
  }, [user, fetchWorkspaces]);

  const addWorkspace = useCallback(async (name, description = '', color = 'violet') => {
    try {
      const newWs = await workspaceService.createWorkspace(name, description, color);
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspace(newWs);
      return newWs;
    } catch (err) {
      console.error('Failed to create workspace', err);
      throw err;
    }
  }, []);

  const editWorkspace = useCallback(async (id, name, description = '') => {
    try {
      const updated = await workspaceService.updateWorkspace(id, name, description);
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)));
      setActiveWorkspace((prev) => (prev?.id === id ? updated : prev));
      return updated;
    } catch (err) {
      console.error('Failed to update workspace', err);
      throw err;
    }
  }, []);

  const removeWorkspace = useCallback(async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
      await fetchWorkspaces();
    } catch (err) {
      console.error('Failed to delete workspace', err);
      throw err;
    }
  }, [fetchWorkspaces]);

  const changeWorkspace = useCallback((wsId) => {
    const ws = workspaces.find((w) => w.id === wsId);
    if (ws) setActiveWorkspace(ws);
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        changeWorkspace,
        addWorkspace,
        editWorkspace,
        removeWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};