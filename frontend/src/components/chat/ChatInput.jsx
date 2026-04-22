import { useState, useRef, useEffect } from 'react';

/**
 * Chat input bar — multi-line textarea with send button.
 * Enter to send, Shift+Enter for newline.
 */
export default function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="glass rounded-2xl p-2 flex items-end gap-2
                 shadow-lg transition-all duration-200
                 focus-within:border-[var(--color-border-accent)]
                 focus-within:shadow-[var(--shadow-glow)]"
    >
      <textarea
        ref={textareaRef}
        id="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents…"
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-[var(--color-text-primary)]
                   placeholder:text-[var(--color-text-tertiary)] text-[0.935rem] leading-relaxed
                   py-2 px-3 max-h-[200px] disabled:opacity-50"
      />

      <button
        id="send-button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-10 h-10 rounded-xl gradient-bg flex items-center justify-center
                   text-white transition-all duration-200
                   hover:opacity-90 hover:shadow-[var(--shadow-glow)]
                   disabled:opacity-30 disabled:cursor-not-allowed
                   active:scale-95 cursor-pointer"
        aria-label="Send message"
      >
        {disabled ? (
          /* Loading spinner */
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          /* Send arrow */
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        )}
      </button>
    </div>
  );
}
