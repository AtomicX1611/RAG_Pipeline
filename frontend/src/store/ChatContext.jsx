import { createContext, useContext, useState, useCallback } from 'react';
import { generateId, deriveTitle } from '../utils/formatters';
import * as chatService from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState({});   // { [convId]: Message[] }
  const [isStreaming, setIsStreaming] = useState(false);

  /** Get messages for the active conversation */
  const activeMessages = messages[activeConversationId] || [];

  /** Create a new conversation and make it active */
  const createConversation = useCallback(() => {
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
  }, []);

  /** Select an existing conversation */
  const selectConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  /** Delete a conversation */
  const deleteConversation = useCallback(
    (id) => {
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

  /** Send a message and receive AI response */
  const sendMessage = useCallback(
    async (text, options = {}) => {
      let convId = activeConversationId;

      // Auto-create conversation if none active
      if (!convId) {
        convId = generateId();
        const newConv = {
          id: convId,
          title: deriveTitle(text),
          preview: '',
          createdAt: new Date().toISOString(),
          messageCount: 0,
        };
        setConversations((prev) => [newConv, ...prev]);
        setMessages((prev) => ({ ...prev, [convId]: [] }));
        setActiveConversationId(convId);
      }

      // Add user message
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

      // Update conversation title if it's the first message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId && c.title === 'New Conversation'
            ? { ...c, title: deriveTitle(text), preview: text }
            : c,
        ),
      );

      // Get AI response
      setIsStreaming(true);
      try {
        const response = await chatService.sendMessage(convId, text, options);

        const aiMsg = {
          id: generateId(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] || []), aiMsg],
        }));

        // Update conversation metadata
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messageCount: (c.messageCount || 0) + 2 }
              : c,
          ),
        );

        return aiMsg;
      } finally {
        setIsStreaming(false);
      }
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
