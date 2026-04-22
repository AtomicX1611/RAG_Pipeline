import { useState } from 'react';

/**
 * Expandable card showing a source document used by the AI response.
 */
export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    source.relevanceScore >= 0.9
      ? 'text-[var(--color-success)]'
      : source.relevanceScore >= 0.8
        ? 'text-[var(--color-info)]'
        : 'text-[var(--color-warning)]';

  return (
    <button
      id={`source-card-${source.id}`}
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left rounded-lg border border-[var(--color-border-primary)]
                 bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-accent)]
                 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">📄</span>
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {source.filename}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-mono font-medium ${scoreColor}`}>
            {(source.relevanceScore * 100).toFixed(0)}%
          </span>
          <svg
            className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform duration-200
                        ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 pb-3 border-t border-[var(--color-border-primary)]">
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            {source.content}
          </p>
        </div>
      </div>
    </button>
  );
}
