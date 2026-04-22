import StreamingText from './StreamingText';
import SourceCard from './SourceCard';

/**
 * Single chat message bubble — renders differently for user vs assistant.
 * @param {{ message: object, isLatest: boolean, isStreaming: boolean }} props
 */
export default function ChatMessage({ message, isLatest = false, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-3 max-w-3xl mx-auto w-full animate-fade-in-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
      style={{ animationDelay: '0.05s' }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center
                     shrink-0 mt-1 shadow-md"
        >
          <span className="text-white text-sm font-bold">N</span>
        </div>
      )}

      {/* Message content */}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
          isUser
            ? 'bg-[var(--color-user-bubble)] text-[var(--color-user-bubble-text)] rounded-br-md'
            : 'bg-[var(--color-ai-bubble)] text-[var(--color-ai-bubble-text)] rounded-bl-md border border-[var(--color-border-primary)]'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-[0.935rem]">{message.content}</p>
        ) : (
          <>
            <div className="text-[0.935rem]">
              <StreamingText
                text={message.content}
                stream={isLatest && isStreaming}
              />
            </div>

            {/* Source documents */}
            {message.sources?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] space-y-2">
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  Sources
                </p>
                {message.sources.map((src) => (
                  <SourceCard key={src.id} source={src} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center
                     justify-center shrink-0 mt-1 border border-[var(--color-border-primary)]"
        >
          <span className="text-[var(--color-text-secondary)] text-sm font-medium">A</span>
        </div>
      )}
    </div>
  );
}
