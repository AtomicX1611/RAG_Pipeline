import { formatRelativeTime, truncateText } from '../../utils/formatters';

/**
 * Single conversation entry in the sidebar.
 */
export default function ConversationItem({ conversation, isActive, onSelect, onDelete }) {
  return (
    <div
      id={`conversation-${conversation.id}`}
      onClick={() => onSelect(conversation.id)}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[var(--color-accent-glow)] border border-[var(--color-border-accent)]'
                      : 'hover:bg-[var(--color-bg-hover)] border border-transparent'
                  }`}
    >
      {/* Chat icon */}
      <div className="shrink-0">
        <svg
          className={`w-4 h-4 ${
            isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-tertiary)]'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate font-medium ${
            isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {truncateText(conversation.title, 32)}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
          {formatRelativeTime(conversation.createdAt)}
        </p>
      </div>

      {/* Delete button (visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 rounded-md
                   flex items-center justify-center
                   hover:bg-[var(--color-error)]/20 text-[var(--color-text-tertiary)]
                   hover:text-[var(--color-error)] transition-all duration-150 cursor-pointer"
        aria-label="Delete conversation"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
