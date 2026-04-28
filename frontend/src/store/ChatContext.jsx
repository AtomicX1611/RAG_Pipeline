import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { generateId, deriveTitle } from '../utils/formatters';
import * as chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState({});   // { [convId]: Message[] }
  const [isStreaming, setIsStreaming] = useState(false);
  const { isAuthenticated } = useAuth();

  /** Get messages for the active conversation */
  const activeMessages = messages[activeConversationId] || [];

  /** Load conversations from backend on auth */
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setMessages({});
      setActiveConversationId(null);
      return;
    }
    chatService.getConversations()
      .then((convs) => {
        if (convs && convs.length > 0) {
          setConversations(convs.map((c) => ({
            id: c.id,
            title: c.title,
            preview: c.preview || '',
            createdAt: c.createdAt,
            messageCount: c.messageCount || 0,
          })));
        }
      })
      .catch(() => { /* silent — backend may be cold */ });
  }, [isAuthenticated]);

  /** Create a new conversation and make it active */
  const createConversation = useCallback(async () => {
    try {
      const created = await chatService.createConversation('New Conversation');
      const newConv = {
        id: created.id,
        title: created.title || 'New Conversation',
        preview: '',
        createdAt: created.createdAt || new Date().toISOString(),
        messageCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({ ...prev, [created.id]: [] }));
      setActiveConversationId(created.id);
      return created.id;
    } catch {
      // Fallback to local-only if backend fails
      const id = generateId();
      const newConv = {
        id,
        title: 'New Conversation',
        preview: '',
        createdAt: new Date().toISOString(),
        messageCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({ ...prev, [id]: [] }));
      setActiveConversationId(id);
      return id;
    }
  }, []);

  /** Select an existing conversation */
  const selectConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  /** Delete a conversation */
  const deleteConversation = useCallback(
    async (id) => {
      try {
        await chatService.deleteConversation(id);
      } catch {
        // allow local deletion even if backend fails
      }
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setMessages((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId],
  );

  /** Send a message using SSE streaming */
  const sendMessage = useCallback(
    async (text, options = {}) => {
      let convId = activeConversationId;

      // Auto-create conversation if none active
      if (!convId) {
        convId = await (async () => {
          try {
            const created = await chatService.createConversation(deriveTitle(text));
            const newConv = {
              id: created.id,
              title: created.title || deriveTitle(text),
              preview: '',
              createdAt: created.createdAt || new Date().toISOString(),
              messageCount: 0,
            };
            setConversations((prev) => [newConv, ...prev]);
            setMessages((prev) => ({ ...prev, [created.id]: [] }));
            setActiveConversationId(created.id);
            return created.id;
          } catch {
            const id = generateId();
            const newConv = {
              id,
              title: deriveTitle(text),
              preview: '',
              createdAt: new Date().toISOString(),
              messageCount: 0,
            };
            setConversations((prev) => [newConv, ...prev]);
            setMessages((prev) => ({ ...prev, [id]: [] }));
            setActiveConversationId(id);
            return id;
          }
        })();
      }

      // Add user message immediately
      const userMsg = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), userMsg],
      }));

      // Update conversation title if first message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId && c.title === 'New Conversation'
            ? { ...c, title: deriveTitle(text), preview: text }
            : c,
        ),
      );

      // Create placeholder AI message for streaming
      const aiMsgId = generateId();
      const aiMsgPlaceholder = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        sources: [],
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), aiMsgPlaceholder],
      }));

      setIsStreaming(true);

      return new Promise((resolve, reject) => {
        chatService.sendMessageStream(
          convId,
          text,
          options,
          {
            onToken: (token) => {
              setMessages((prev) => {
                const msgs = prev[convId] || [];
                return {
                  ...prev,
                  [convId]: msgs.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: m.content + token }
                      : m,
                  ),
                };
              });
            },
            onSources: (sources) => {
              setMessages((prev) => {
                const msgs = prev[convId] || [];
                return {
                  ...prev,
                  [convId]: msgs.map((m) =>
                    m.id === aiMsgId ? { ...m, sources } : m,
                  ),
                };
              });
            },
            onDone: () => {
              setIsStreaming(false);
              setMessages((prev) => {
                const msgs = prev[convId] || [];
                const finalMsgs = msgs.map((m) =>
                  m.id === aiMsgId ? { ...m, isStreaming: false } : m,
                );
                const aiMsg = finalMsgs.find((m) => m.id === aiMsgId);
                resolve(aiMsg);
                return { ...prev, [convId]: finalMsgs };
              });
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? { ...c, messageCount: (c.messageCount || 0) + 2 }
                    : c,
                ),
              );
            },
            onError: (err) => {
              setIsStreaming(false);
              // Update the placeholder with the actual error message
              setMessages((prev) => {
                const msgs = prev[convId] || [];
                return {
                  ...prev,
                  [convId]: msgs.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: m.content || (err?.message || 'Sorry, something went wrong. Please try again.'),
                          isStreaming: false,
                          isError: true,
                        }
                      : m,
                  ),
                };
              });
              reject(err);
            },
          },
        );
      });
    },
    [activeConversationId],
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeMessages,
        isStreaming,
        createConversation,
        selectConversation,
        deleteConversation,
        sendMessage,
        setConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
