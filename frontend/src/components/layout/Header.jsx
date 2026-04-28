import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

const PAGE_TITLES = {
  '/chat': 'Chat',
  '/documents': 'Knowledge Base',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

/**
 * Top header bar — sidebar toggle, page title, and quick actions.
 */
export default function Header() {
  const { toggleSidebar, showUploadZone, setShowUploadZone } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = PAGE_TITLES[location.pathname] || 'NeuralSearch';
  const isChat = location.pathname === '/chat';

  return (
    <header
      id="app-header"
      className="h-14 flex items-center justify-between px-4
                 border-b border-[var(--color-border-primary)]
                 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm"
    >
      {/* Left: Sidebar toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)]
                     text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                     transition-colors duration-150 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{pageTitle}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Upload toggle — only on chat page */}
        {isChat && (
          <button
            id="upload-toggle"
            onClick={() => setShowUploadZone((v) => !v)}
            className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer ${
              showUploadZone
                ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]'
                : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
            aria-label="Toggle file upload"
            title="Upload documents"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
              />
            </svg>
          </button>
        )}

        {/* Analytics shortcut */}
        <button
          id="analytics-shortcut"
          onClick={() => navigate('/analytics')}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)]
                     text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                     transition-colors duration-150 cursor-pointer"
          title="View analytics"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </button>

        {/* Settings shortcut */}
        <button
          id="settings-shortcut"
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)]
                     text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                     transition-colors duration-150 cursor-pointer"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
