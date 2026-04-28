/**
 * Renders AI message text — shows a blinking cursor while streaming.
 * With real SSE streaming, text is already arriving incrementally from the server.
 * This component just renders the text + cursor state correctly.
 */
export default function StreamingText({ text, stream = false }) {
  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {text}
      {stream && <span className="typing-cursor" />}
    </div>
  );
}
