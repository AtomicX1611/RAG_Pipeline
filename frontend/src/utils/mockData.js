/**
 * Mock data for development — replaced by real API responses in production.
 */

export const MOCK_USER = {
  id: 'user-001',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: null,
};

/**
 * Generate a simulated AI response for a given query.
 * @param {string} query
 * @returns {{ answer: string, sources: Array }}
 */
export function generateMockResponse(query) {
  const responses = {
    default: {
      answer: `Based on the documents in your knowledge base, here's what I found regarding your question:\n\n**Key Findings:**\n\n1. The documents contain relevant information that addresses your query about "${query.slice(0, 50)}..."\n\n2. Multiple sources corroborate the following points:\n   - The primary topic is well-documented across several uploaded files\n   - There are complementary details that provide additional context\n   - The evidence supports a comprehensive understanding of this subject\n\n3. **Important Context:** The RAG pipeline used semantic retrieval to identify the most relevant passages, ensuring high-quality results.\n\n> *Note: This is a simulated response. Connect the backend API for real document-grounded answers.*`,
      sources: [
        {
          id: 'src-1',
          filename: 'company_overview.txt',
          content: 'This document provides comprehensive information about the organization\'s structure, mission, and key operational areas that are directly relevant to the query.',
          relevanceScore: 0.94,
        },
        {
          id: 'src-2',
          filename: 'quarterly_report.pdf',
          content: 'The quarterly report contains financial metrics and performance data that support the findings summarized in the response.',
          relevanceScore: 0.87,
        },
        {
          id: 'src-3',
          filename: 'research_notes.txt',
          content: 'Research notes from the team provide additional context and technical details relevant to this topic area.',
          relevanceScore: 0.79,
        },
      ],
    },
  };

  return responses.default;
}

/**
 * Sample conversations for sidebar display.
 */
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'How does Tesla generate revenue?',
    preview: 'Based on the documents, Tesla generates revenue through...',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    messageCount: 4,
  },
  {
    id: 'conv-2',
    title: 'Microsoft acquisition strategy',
    preview: 'Microsoft has acquired several companies including GitHub...',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    messageCount: 6,
  },
  {
    id: 'conv-3',
    title: 'NVIDIA GPU architecture overview',
    preview: 'NVIDIA\'s GPU architecture has evolved significantly...',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    messageCount: 3,
  },
];
