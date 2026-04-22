import { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useFileUpload } from '../hooks/useFileUpload';
import { useApp } from '../store/AppContext';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import FileUpload from '../components/upload/FileUpload';
import ChunkingSelector from '../components/settings/ChunkingSelector';
import { APP_NAME, SUGGESTION_PROMPTS } from '../utils/constants';

/**
 * Main chat interface page — message list, input, upload zone, chunking selector.
 */
export default function ChatPage() {
  const {
    activeMessages,
    isStreaming,
    sendMessage,
  } = useChat();

  const {
    chunkingStrategy,
    setChunkingStrategy,
    showUploadZone,
  } = useApp();

  const {
    uploadedFiles,
    uploading,
    uploadProgress,
    error: uploadError,
    handleFilesSelected,
    removeFile,
    clearFiles,
    upload,
  } = useFileUpload();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = async (text) => {
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeMessages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg mb-6 animate-float">
              <span className="text-4xl text-white font-bold">N</span>
            </div>
            <h2 className="text-2xl font-semibold gradient-text mb-2">
              Welcome to {APP_NAME}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm mb-8 leading-relaxed">
              Upload your documents and ask questions. I&apos;ll find the most relevant information using advanced RAG techniques.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTION_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 rounded-xl
                             border border-[var(--color-border-primary)]
                             bg-[var(--color-bg-secondary)]
                             hover:border-[var(--color-border-accent)]
                             hover:bg-[var(--color-accent-glow)]
                             text-sm text-[var(--color-text-secondary)]
                             hover:text-[var(--color-text-primary)]
                             transition-all duration-200 cursor-pointer"
                >
                  <span className="text-[var(--color-accent-secondary)] mr-1.5">→</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-6 pb-4">
            {activeMessages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatest={idx === activeMessages.length - 1}
                isStreaming={isStreaming && msg.role === 'assistant'}
              />
            ))}

            {/* Typing indicator while waiting for response */}
            {isStreaming && activeMessages[activeMessages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 max-w-3xl mx-auto animate-fade-in-up">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-[var(--color-ai-bubble)] border border-[var(--color-border-primary)]">
                  <div className="typing-dots flex items-center gap-0.5 py-1">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
          {/* Upload zone (toggled from header) */}
          {showUploadZone && (
            <div className="glass rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Documents & Settings</h3>
              </div>
              <FileUpload
                uploadedFiles={uploadedFiles}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={removeFile}
                onClearFiles={clearFiles}
                onUpload={upload}
                uploading={uploading}
                uploadProgress={uploadProgress}
                error={uploadError}
              />
              <ChunkingSelector
                value={chunkingStrategy}
                onChange={setChunkingStrategy}
              />
            </div>
          )}

          {/* Chat input */}
          <ChatInput onSend={handleSend} disabled={isStreaming} />

          <p className="text-xs text-center text-[var(--color-text-tertiary)]">
            {APP_NAME} uses RAG to ground responses in your uploaded documents.
          </p>
        </div>
      </div>
    </div>
  );
}
