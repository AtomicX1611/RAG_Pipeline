/**
 * Application constants — single source of truth for configurable values.
 */

export const APP_NAME = 'NeuralSearch';
export const APP_TAGLINE = 'AI-Powered Document Intelligence';
export const APP_DESCRIPTION = 'Upload documents, choose a chunking strategy, and ask questions — powered by RAG.';

/** Base URL for all API requests */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Supported file types for upload */
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
};

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Chunking strategies available in the backend */
export const CHUNKING_STRATEGIES = [
  {
    id: 'fixed',
    name: 'Fixed Size',
    description: 'Splits text into fixed-length chunks with optional overlap.',
    icon: '▦',
  },
  {
    id: 'recursive',
    name: 'Recursive',
    description: 'Recursively splits using hierarchy of separators (paragraphs → sentences → words).',
    icon: '⟳',
  },
  {
    id: 'semantic',
    name: 'Semantic',
    description: 'Groups text by meaning using embedding similarity breakpoints.',
    icon: '◈',
  },
  {
    id: 'agentic',
    name: 'Agentic',
    description: 'LLM-powered chunking that identifies natural topic boundaries.',
    icon: '✦',
  },
];

/** Default chunking strategy */
export const DEFAULT_CHUNKING_STRATEGY = 'recursive';

/** Retrieval methods available */
export const RETRIEVAL_METHODS = [
  { id: 'similarity', name: 'Similarity Search' },
  { id: 'multi_query', name: 'Multi-Query Retrieval' },
  { id: 'rrf', name: 'Reciprocal Rank Fusion' },
];

/** Streaming simulation speed (ms per character) */
export const STREAM_SPEED_MS = 18;

/** Suggestion chips for empty chat state */
export const SUGGESTION_PROMPTS = [
  'What are the key topics in my documents?',
  'Summarize the most important findings',
  'Compare the main themes across files',
  'What questions can I ask about my data?',
];
