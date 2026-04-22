import { useStreaming } from '../../hooks/useStreaming';

/**
 * Renders text with a streaming (typewriter) effect.
 * Used for the latest AI response only — older messages render instantly.
 */
export default function StreamingText({ text, stream = false }) {
  const { displayedText, isStreaming, skipToEnd } = useStreaming(text, stream);

  return (
    <div className="relative" onClick={isStreaming ? skipToEnd : undefined}>
      <div className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
        {isStreaming && <span className="typing-cursor" />}
      </div>
      {isStreaming && (
        <button
          onClick={skipToEnd}
          className="mt-2 text-xs px-2 py-1 rounded-md
                     bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]
                     hover:text-[var(--color-text-secondary)]
                     transition-colors duration-200 cursor-pointer"
          aria-label="Skip streaming animation"
        >
          Skip ↓
        </button>
      )}
    </div>
  );
}
