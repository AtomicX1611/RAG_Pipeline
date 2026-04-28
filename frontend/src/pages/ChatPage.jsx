import { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useFileUpload } from '../hooks/useFileUpload';
import { useApp } from '../store/AppContext';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import FileUpload from '../components/upload/FileUpload';
import ChunkingSelector from '../components/settings/ChunkingSelector';
import { APP_NAME, SUGGESTION_PROMPTS, RETRIEVAL_METHODS } from '../utils/constants';

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
    retrievalMethod,
    setRetrievalMethod,
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
  const [showSources, setShowSources] = useState(null); // message id

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = async (text) => {
    await sendMessage(text);
  };

  return (
    <div className="flex h-full">
      {/* Main chat column */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
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
            <div className="space-y-6 pb-4 max-w-3xl mx-auto">
              {activeMessages.map((msg, idx) => (
                <div key={msg.id}>
                  <ChatMessage
                    message={msg}
                    isLatest={idx === activeMessages.length - 1}
                    isStreaming={isStreaming && msg.isStreaming}
                  />
                  {/* Sources toggle */}
                  {msg.role === 'assistant' && msg.sources?.length > 0 && (
                    <div className="mt-2 ml-11">
                      <button
                        onClick={() => setShowSources(showSources === msg.id ? null : msg.id)}
                        className="text-xs text-[var(--color-accent-secondary)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showSources === msg.id ? '▾' : '▸'}</span>
                        {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                      </button>
                      {showSources === msg.id && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                          {msg.sources.map((src) => (
                            <div key={src.id} className="rounded-xl p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{src.filename}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent-secondary)] ml-2 flex-shrink-0">
                                  {Math.round(src.relevanceScore * 100)}% match
                                </span>
                              </div>
                              <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed line-clamp-3">{src.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator while waiting for first token */}
              {isStreaming && activeMessages[activeMessages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 animate-fade-in-up">
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
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Documents &amp; Settings</h3>
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
                {/* Retrieval method selector inline */}
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Retrieval Method</p>
                  <div className="flex gap-2 flex-wrap">
                    {RETRIEVAL_METHODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setRetrievalMethod(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          retrievalMethod === m.id
                            ? 'bg-[var(--color-accent-primary)] text-white'
                            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
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
    </div>
  );
}
