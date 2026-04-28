import { useCallback } from 'react';
import { useChat as useChatContext } from '../store/ChatContext';
import { useApp } from '../store/AppContext';

/**
 * High-level chat hook that combines ChatContext and AppContext
 * for a single, convenient API consumed by chat components.
 */
export function useChat() {
  const {
    conversations,
    activeConversationId,
    activeMessages,
    isStreaming,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage: ctxSendMessage,
  } = useChatContext();

  const { chunkingStrategy, retrievalMethod } = useApp();

  const sendMessage = useCallback(
    (text) =>
      ctxSendMessage(text, {
        chunkingStrategy,
        retrievalMethod,
      }),
    [ctxSendMessage, chunkingStrategy, retrievalMethod],
  );

  return {
    conversations,
    activeConversationId,
    activeMessages,
    isStreaming,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  };
}
