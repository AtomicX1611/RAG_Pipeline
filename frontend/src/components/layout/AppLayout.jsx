import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Header from './Header';
import { useApp } from '../../store/AppContext';
import { useChat } from '../../hooks/useChat';

/**
 * Main application layout — sidebar + header + page content.
 */
export default function AppLayout() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createConversation,
    deleteConversation,
  } = useChat();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={createConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
