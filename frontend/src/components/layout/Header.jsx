import { useApp } from '../../store/AppContext';

/**
 * Top header bar — sidebar toggle, settings icons.
 */
export default function Header() {
  const { toggleSidebar, showUploadZone, setShowUploadZone } = useApp();

  return (
    <header
      id="app-header"
      className="h-14 flex items-center justify-between px-4
                 border-b border-[var(--color-border-primary)]
                 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm"
    >
      {/* Left: Sidebar toggle */}
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

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Upload toggle */}
        <button
          id="upload-toggle"
          onClick={() => setShowUploadZone((v) => !v)}
          className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer ${
            showUploadZone
              ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]'
              : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          aria-label="Toggle file upload"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
