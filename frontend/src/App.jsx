import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { WorkspaceProvider, useWorkspace } from './store/WorkspaceContext';
import { ChatProvider, useChat } from './store/ChatContext';
import { AppProvider } from './store/AppContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import WorkspacesPage from './pages/WorkspacesPage';
import { useEffect } from 'react';

/**
 * Bridges the active workspace from WorkspaceContext into ChatContext.
 * Must be rendered inside both providers.
 */
function WorkspaceChatBridge() {
  const { activeWorkspace } = useWorkspace();
  const { setActiveWorkspaceId } = useChat();

  useEffect(() => {
    if (activeWorkspace?.id) {
      setActiveWorkspaceId(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, setActiveWorkspaceId]);

  return null;
}

/**
 * Redirect to login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Redirect to chat if already authenticated.
 */
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 overflow-hidden">
         <div className="animate-pulse text-xl text-gray-400">Loading neural pathways...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <ChatProvider>
            <AppProvider>
              <WorkspaceChatBridge />
              <AppRoutes />
            </AppProvider>
          </ChatProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
