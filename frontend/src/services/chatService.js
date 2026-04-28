/**
 * Chat API service — all chat-related backend communication.
 * Supports both standard JSON and SSE streaming responses.
 */
import api from './api';
import { API_BASE_URL } from '../utils/constants';

/**
 * Send a chat message and receive an AI response (non-streaming).
 */
export async function sendMessage(conversationId, message, options = {}) {
  const { data } = await api.post('/api/chat', {
    conversation_id: conversationId,
    workspace_id: options.workspaceId || 'default',
    message,
    chunking_strategy: options.chunkingStrategy || 'recursive',
    retrieval_method: options.retrievalMethod || 'similarity',
  });
  return data;
}

/**
 * Send a chat message and stream the response via SSE.
 * @returns {function} abort function
 */
export function sendMessageStream(
  conversationId,
  message,
  options = {},
  { onToken, onSources, onDone, onError } = {},
) {
  const authToken = localStorage.getItem('auth_token');
  const controller = new AbortController();

  const body = JSON.stringify({
    conversation_id: conversationId,
    workspace_id: options.workspaceId || 'default',
    message,
    chunking_strategy: options.chunkingStrategy || 'recursive',
    retrieval_method: options.retrievalMethod || 'similarity',
  });

  fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body,
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Stream failed' }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        let currentEvent = null;

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const rawData = line.slice(6);

            if (rawData === '[DONE]') {
              onDone?.();
            } else if (currentEvent === 'sources') {
              try {
                onSources?.(JSON.parse(rawData));
              } catch {
                // ignore JSON parse errors on sources
              }
              currentEvent = null;
            } else if (currentEvent === 'error') {
              // Backend sent a structured error event
              try {
                const payload = JSON.parse(rawData);
                onError?.(new Error(payload.detail || 'Server error'));
              } catch {
                onError?.(new Error(rawData));
              }
              currentEvent = null;
            } else {
              // Regular token — unescape \n that was escaped for SSE transport
              const tok = rawData.replace(/\\n/g, '\n');
              onToken?.(tok);
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError?.(err);
      }
    });

  return () => controller.abort();
}

/**
 * Fetch all conversations for the current user, optionally filtered by workspace.
 */
export async function getConversations(workspaceId = null) {
  const params = workspaceId ? { workspace_id: workspaceId } : {};
  const { data } = await api.get('/api/conversations', { params });
  return data;
}

/**
 * Create a new conversation, optionally scoped to a workspace.
 */
export async function createConversation(title = 'New Conversation', workspaceId = 'default') {
  const { data } = await api.post('/api/conversations', {
    title,
    workspace_id: workspaceId,
  });
  return data;
}

/**
 * Delete a conversation by ID.
 */
export async function deleteConversation(conversationId) {
  await api.delete(`/api/conversations/${conversationId}`);
}
