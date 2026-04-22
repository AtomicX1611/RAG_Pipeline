import ConversationItem from './ConversationItem';
import { useAuth } from '../../store/AuthContext';
import { APP_NAME } from '../../utils/constants';

/**
 * Left sidebar — conversation history, new chat button, user profile.
 */
export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose,
}) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-[var(--spacing-sidebar)] z-50
                    bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)]
                    flex flex-col transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}
      >
        {/* Logo + New Chat */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h1 className="text-lg font-semibold gradient-text">{APP_NAME}</h1>
          </div>

          <button
            id="new-chat-button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                       rounded-xl border border-dashed border-[var(--color-border-hover)]
                       text-[var(--color-text-secondary)] text-sm font-medium
                       hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)]
                       hover:bg-[var(--color-accent-glow)] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-[var(--color-text-tertiary)]"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)]">No conversations yet</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onSelect={onSelectConversation}
                onDelete={onDeleteConversation}
              />
            ))
          )}
        </div>

        {/* User profile */}
        {user && (
          <div className="p-3 border-t border-[var(--color-border-primary)]">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-primary)]">
                <span className="text-sm font-medium text-[var(--color-accent-secondary)]">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate">{user.email}</p>
              </div>
              <button
                id="logout-button"
                onClick={logout}
                className="shrink-0 p-1.5 rounded-md hover:bg-[var(--color-bg-elevated)]
                           text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]
                           transition-colors duration-150 cursor-pointer"
                aria-label="Sign out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
