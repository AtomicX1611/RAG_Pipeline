import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../store/AppContext';
import FileUpload from '../components/upload/FileUpload';
import ChunkingSelector from '../components/settings/ChunkingSelector';
import { useFileUpload } from '../hooks/useFileUpload';
import * as documentsService from '../services/documentsService';

/**
 * Documents page — upload and manage indexed knowledge base.
 */
export default function DocumentsPage() {
  const { chunkingStrategy, setChunkingStrategy } = useApp();
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

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await documentsService.getDocumentStats();
      setStats(data);
    } catch {
      setStats({ totalChunks: 0, hasDocuments: false, message: 'Could not load stats.' });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpload = useCallback(async () => {
    await upload();
    await fetchStats();
    setSuccessMsg('Documents uploaded and indexed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }, [upload, fetchStats]);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      await documentsService.deleteAllDocuments();
      await fetchStats();
      setSuccessMsg('All documents deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }, [deleteConfirm, fetchStats]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Page header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text mb-2">Knowledge Base</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Upload and manage your documents. Choose a chunking strategy before uploading.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
          <StatCard
            label="Total Chunks"
            value={loadingStats ? '—' : (stats?.totalChunks ?? 0)}
            icon="🧩"
            color="accent"
          />
          <StatCard
            label="Collection Status"
            value={loadingStats ? '—' : (stats?.hasDocuments ? 'Active' : 'Empty')}
            icon="📦"
            color={stats?.hasDocuments ? 'green' : 'muted'}
          />
          <StatCard
            label="Chunking Strategy"
            value={chunkingStrategy.charAt(0).toUpperCase() + chunkingStrategy.slice(1)}
            icon="⚡"
            color="purple"
          />
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="rounded-xl px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in flex items-center gap-2">
            <span>✓</span>
            {successMsg}
          </div>
        )}

        {/* Upload panel */}
        <div className="glass rounded-2xl p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white text-sm">↑</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Upload Documents</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">PDF and TXT files supported, up to 20MB each</p>
            </div>
          </div>
          <FileUpload
            uploadedFiles={uploadedFiles}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={removeFile}
            onClearFiles={clearFiles}
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            error={uploadError}
          />
          <div className="border-t border-[var(--color-border-primary)] pt-4">
            <ChunkingSelector value={chunkingStrategy} onChange={setChunkingStrategy} />
          </div>
        </div>

        {/* Chunking strategies explainer */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            About Chunking Strategies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STRATEGY_CARDS.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                  chunkingStrategy === s.id
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]'
                    : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-hover)]'
                }`}
                onClick={() => setChunkingStrategy(s.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{s.name}</span>
                  {chunkingStrategy === s.id && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)] text-white">Active</span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{s.detail}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        {stats?.hasDocuments && (
          <div className="glass rounded-2xl p-6 border border-red-500/20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Permanently delete all {stats.totalChunks} indexed chunks from your knowledge base.
              This cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                deleteConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
              }`}
            >
              {deleting ? 'Deleting…' : deleteConfirm ? 'Confirm — Delete Everything' : 'Delete All Documents'}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="ml-3 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    accent: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    green: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    purple: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
    muted: 'from-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)] border-[var(--color-border-primary)]',
  };
  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br border ${colorMap[color] || colorMap.muted}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{label}</p>
    </div>
  );
}

const STRATEGY_CARDS = [
  {
    id: 'fixed',
    name: 'Fixed Size',
    icon: '▦',
    detail: 'Splits text into fixed-length chunks using CharacterTextSplitter. Simple and predictable — great for uniform documents.',
    tags: ['CharacterTextSplitter', 'Fast', 'Uniform'],
  },
  {
    id: 'recursive',
    name: 'Recursive',
    icon: '⟳',
    detail: 'Recursively splits using paragraph → sentence → word hierarchy. Preserves semantic structure better than fixed splitting.',
    tags: ['RecursiveCharacterTextSplitter', 'Balanced', 'Recommended'],
  },
  {
    id: 'semantic',
    name: 'Semantic',
    icon: '◈',
    detail: 'Uses OpenAI embeddings to detect topic shifts and split at semantic breakpoints. Best for mixed-topic documents.',
    tags: ['SemanticChunker', 'Embedding-based', 'High Quality'],
  },
  {
    id: 'agentic',
    name: 'Agentic',
    icon: '✦',
    detail: 'Uses GPT to intelligently identify natural topic boundaries. Most intelligent chunking — ideal for complex documents.',
    tags: ['LLM-powered', 'GPT-3.5', 'Most Accurate'],
  },
];
