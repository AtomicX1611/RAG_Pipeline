import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { CHUNKING_STRATEGIES, RETRIEVAL_METHODS } from '../utils/constants';

/**
 * Settings page — configure retrieval method, chunking strategy, user profile.
 */
export default function SettingsPage() {
  const { chunkingStrategy, setChunkingStrategy, retrievalMethod, setRetrievalMethod } = useApp();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Configure your RAG pipeline and account preferences.
          </p>
        </div>

        {/* User Profile */}
        {user && (
          <div className="glass rounded-2xl p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Account</h2>
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full border-2 border-[var(--color-border-accent)]" />
              ) : (
                <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{user.name}</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">{user.email}</p>
              </div>
              <button
                id="settings-logout"
                onClick={logout}
                className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Retrieval Method */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Retrieval Method</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-5">
            How your questions are matched to document chunks.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {RETRIEVAL_METHODS.map((m) => (
              <OptionCard
                key={m.id}
                id={m.id}
                title={m.name}
                description={RETRIEVAL_DESCRIPTIONS[m.id]}
                badge={RETRIEVAL_BADGES[m.id]}
                selected={retrievalMethod === m.id}
                onClick={() => setRetrievalMethod(m.id)}
              />
            ))}
          </div>
        </div>

        {/* Chunking Strategy */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Default Chunking Strategy</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-5">
            How uploaded documents are split into searchable chunks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHUNKING_STRATEGIES.map((s) => (
              <OptionCard
                key={s.id}
                id={s.id}
                title={`${s.icon} ${s.name}`}
                description={s.description}
                selected={chunkingStrategy === s.id}
                onClick={() => setChunkingStrategy(s.id)}
              />
            ))}
          </div>
        </div>

        {/* About */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">About NeuralSearch</h2>
          <div className="space-y-3">
            {ABOUT_ROWS.map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[var(--color-border-primary)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ id, title, description, badge, selected, onClick }) {
  return (
    <button
      id={`option-${id}`}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]'
          : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-elevated)]'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${selected ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">{badge}</span>
          )}
          {selected && (
            <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent-primary)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)]" />
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{description}</p>
    </button>
  );
}

const RETRIEVAL_DESCRIPTIONS = {
  similarity: 'Basic cosine similarity search in ChromaDB. Fastest and most deterministic. Great for straightforward questions.',
  multi_query: 'LLM generates 3 query variations and retrieves docs for each. Deduplicates and re-ranks. Better recall than similarity.',
  rrf: 'Multi-query + Reciprocal Rank Fusion. Combines rankings from multiple retrieval lists for maximum precision and recall.',
};

const RETRIEVAL_BADGES = {
  similarity: 'Fast',
  multi_query: 'Balanced',
  rrf: 'Best Quality',
};

const ABOUT_ROWS = [
  { label: 'Version', value: '2.0.0' },
  { label: 'Backend', value: 'FastAPI + LangChain' },
  { label: 'Vector Store', value: 'ChromaDB (cosine similarity)' },
  { label: 'Embedding Model', value: 'text-embedding-3-small' },
  { label: 'LLM', value: 'GPT-4o' },
  { label: 'Chunking', value: '4 strategies (Fixed, Recursive, Semantic, Agentic)' },
];
