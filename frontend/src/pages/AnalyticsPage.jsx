import { useState, useEffect } from 'react';
import * as analyticsService from '../services/analyticsService';

/**
 * Analytics page — beautiful usage dashboard.
 */
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent-primary)] border-t-transparent animate-spin" />
          <p className="text-[var(--color-text-secondary)] text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const maxActivity = Math.max(...(analytics?.dailyActivity?.map((d) => d.messages) || [1]), 1);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text mb-2">Analytics</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Your RAG pipeline usage statistics and performance metrics.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <KpiCard label="Conversations" value={analytics.totalConversations} icon="💬" trend="+2 today" />
          <KpiCard label="Total Messages" value={analytics.totalMessages} icon="📨" trend={`Avg ${analytics.avgMessagesPerConversation}/conv`} />
          <KpiCard label="Document Chunks" value={analytics.totalDocumentChunks} icon="🧩" trend="Indexed" />
          <KpiCard label="Files Uploaded" value={analytics.totalUploads} icon="📁" trend="All time" />
        </div>

        {/* Activity Chart + Retrieval Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Bar Chart */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">7-Day Activity</h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-6">Messages per day</p>
            <div className="flex items-end gap-2 h-40">
              {analytics.dailyActivity.map((day) => {
                const height = maxActivity > 0 ? Math.max((day.messages / maxActivity) * 100, 4) : 4;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-purple-400 transition-all duration-700 relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center px-2 py-1 rounded bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-primary)] whitespace-nowrap z-10">
                        {day.messages} msgs
                      </div>
                    </div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)]">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retrieval Method Usage */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Retrieval Methods</h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-6">Usage breakdown</p>
            <div className="space-y-4">
              {analytics.retrievalUsage.map((r, i) => (
                <div key={r.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-secondary)]">{r.method}</span>
                    <span className="text-[var(--color-text-tertiary)]">{r.count} queries · {r.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${RETRIEVAL_COLORS[i % RETRIEVAL_COLORS.length]}`}
                      style={{ width: `${r.percentage || (r.count === 0 ? 0 : 5)}%`, animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chunking Strategy Donut + Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chunking Strategies */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Chunking Strategies</h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-6">Upload strategy distribution</p>
            <div className="space-y-3">
              {analytics.chunkingUsage.map((c, i) => (
                <div key={c.strategy} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CHUNKING_COLORS[i % CHUNKING_COLORS.length]}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)] capitalize">{c.strategy}</span>
                      <span className="text-[var(--color-text-tertiary)]">{c.count} · {c.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CHUNKING_COLORS[i % CHUNKING_COLORS.length]}`}
                        style={{ width: `${c.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sources */}
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Uploaded Sources</h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-4">Your indexed documents</p>
            {analytics.topSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm text-[var(--color-text-tertiary)]">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.topSources.map((src, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] group hover:bg-[var(--color-bg-hover)] transition-colors">
                    <span className="text-lg">
                      {src.endsWith('.pdf') ? '📄' : '📝'}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] truncate flex-1">{src}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RAG Pipeline info */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{step.title}</span>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, trend }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full">{trend}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{label}</p>
      </div>
    </div>
  );
}

const RETRIEVAL_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500'];
const CHUNKING_COLORS = ['bg-violet-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500'];

const PIPELINE_STEPS = [
  {
    icon: '📥',
    title: 'Ingestion',
    desc: 'Documents are loaded, text extracted via pypdf, and split using your chosen chunking strategy into LangChain Documents.',
  },
  {
    icon: '🔍',
    title: 'Retrieval',
    desc: 'Multi-query expansion generates query variations, which are searched via cosine similarity in ChromaDB. RRF re-ranks results.',
  },
  {
    icon: '🤖',
    title: 'Generation',
    desc: 'GPT-4o generates grounded answers from the retrieved context with full chat history awareness and contextual query rewriting.',
  },
];
