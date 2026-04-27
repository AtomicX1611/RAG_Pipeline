/**
 * Chat API service — all chat-related backend communication.
 * Currently returns mock data; swap implementations when backend is ready.
 */
import api from './api';
import { generateMockResponse, MOCK_CONVERSATIONS } from '../utils/mockData';

const USE_MOCK = false; // flip to false once backend is live

/**
 * Send a chat message and receive an AI response.
 * @param {string} conversationId
 * @param {string} message
 * @param {object} options - { chunkingStrategy, retrievalMethod }
 * @returns {Promise<{ answer: string, sources: Array }>}
 */
export async function sendMessage(conversationId, message, options = {}) {
  if (USE_MOCK) {
    await delay(600);
    return generateMockResponse(message);
  }

  const { data } = await api.post('/api/chat', {
    conversation_id: conversationId,
    message,
    chunking_strategy: options.chunkingStrategy,
    retrieval_method: options.retrievalMethod,
  });
  return data;
}

/**
 * Fetch all conversations for the current user.
 * @returns {Promise<Array>}
 */
export async function getConversations() {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_CONVERSATIONS;
  }

  const { data } = await api.get('/api/conversations');
  return data;
}

/**
 * Create a new conversation.
 * @param {string} title
 * @returns {Promise<{ id: string, title: string }>}
 */
export async function createConversation(title = 'New Conversation') {
  if (USE_MOCK) {
    await delay(200);
    return {
      id: `conv-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      messageCount: 0,
    };
  }

  const { data } = await api.post('/api/conversations', { title });
  return data;
}

/**
 * Delete a conversation by ID.
 * @param {string} conversationId
 */
export async function deleteConversation(conversationId) {
  if (USE_MOCK) {
    await delay(200);
    return;
  }

  await api.delete(`/api/conversations/${conversationId}`);
}

/* ---------- helpers ---------- */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
