import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../store/WorkspaceContext';

const COLOR_DOT = {
  violet: 'bg-violet-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500',
  rose: 'bg-rose-500', amber: 'bg-amber-500', cyan: 'bg-cyan-500',
  pink: 'bg-pink-500', indigo: 'bg-indigo-500',
};
const COLOR_RING = {
  violet: 'ring-violet-500/40', blue: 'ring-blue-500/40', emerald: 'ring-emerald-500/40',
  rose: 'ring-rose-500/40', amber: 'ring-amber-500/40', cyan: 'ring-cyan-500/40',
  pink: 'ring-pink-500/40', indigo: 'ring-indigo-500/40',
};
const COLOR_BG = {
  violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
  blue: 'from-blue-500/10 to-sky-500/10 border-blue-500/20',
  emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
  amber: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20',
  cyan: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/20',
  pink: 'from-pink-500/10 to-fuchsia-500/10 border-pink-500/20',
  indigo: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20',
};
const COLOR_OPTIONS = Object.keys(COLOR_DOT);

function WorkspaceCard({ workspace, isActive, onSelect, onDelete, canDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const bg = COLOR_BG[workspace.color] || COLOR_BG.violet;
  const dot = COLOR_DOT[workspace.color] || COLOR_DOT.violet;
  const ring = COLOR_RING[workspace.color] || COLOR_RING.violet;

  const handleSelect = () => {
    onSelect(workspace.id);
    navigate('/chat');
  };

  return (
    <div
      className={`relative group rounded-2xl p-5 bg-gradient-to-br border transition-all duration-200
                  ${bg}
                  ${isActive ? `ring-2 ${ring}` : 'hover:scale-[1.02]'}
                  cursor-pointer`}
      onClick={handleSelect}
    >
      {/* Active badge */}
      {isActive && (
        <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full
                         bg-[var(--color-accent-primary)] text-white font-medium">
          Active
        </span>
      )}

      {/* Color dot + Name */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
          {workspace.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-text-secondary)] mb-4 line-clamp-2 min-h-[2.5rem]">
        {workspace.description || 'No description'}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-tertiary)]">
        <span>📄 {workspace.document_count ?? 0} docs</span>
        <span>🕐 {new Date(workspace.created_at).toLocaleDateString()}</span>
      </div>

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (deleteConfirm) { onDelete(workspace.id); setDeleteConfirm(false); }
            else setDeleteConfirm(true);
          }}
          onBlur={() => setTimeout(() => setDeleteConfirm(false), 200)}
          className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100
                      p-1.5 rounded-lg text-xs transition-all cursor-pointer
                      ${deleteConfirm ? 'bg-red-500 text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:text-red-400'}`}
          title={deleteConfirm ? 'Click again to confirm' : 'Delete workspace'}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace, changeWorkspace, addWorkspace, removeWorkspace, loading } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('violet');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await addWorkspace(newName.trim(), newDesc.trim(), newColor);
      setNewName('');
      setNewDesc('');
      setNewColor('violet');
      setShowCreate(false);
    } catch (err) {
      setError('Failed to create workspace. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-1">Workspaces</h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Organize your documents and conversations into isolated workspaces.
            </p>
          </div>
          <button
            id="create-workspace-btn"
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-[var(--color-accent-primary)] text-white text-sm font-medium
                       hover:opacity-90 transition-opacity cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Workspace
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Create Workspace</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Name *</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Research Papers"
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-xl text-sm
                               bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                               text-[var(--color-text-primary)] focus:outline-none
                               focus:border-[var(--color-accent-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Description</label>
                  <input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="What is this workspace for?"
                    maxLength={200}
                    className="w-full px-3 py-2 rounded-xl text-sm
                               bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                               text-[var(--color-text-primary)] focus:outline-none
                               focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>
              {/* Color picker */}
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full ${COLOR_DOT[c]} cursor-pointer
                                  transition-transform hover:scale-110
                                  ${newColor === c ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-secondary)] ' + COLOR_RING[c].replace('/40', '') : ''}`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="px-5 py-2 rounded-xl text-sm font-medium
                             bg-[var(--color-accent-primary)] text-white
                             hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {creating ? 'Creating…' : 'Create Workspace'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium
                             bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]
                             hover:bg-[var(--color-bg-hover)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workspace grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl p-5 border border-[var(--color-border-primary)] animate-pulse h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                isActive={ws.id === activeWorkspace?.id}
                onSelect={changeWorkspace}
                onDelete={removeWorkspace}
                canDelete={workspaces.length > 1}
              />
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">How Workspaces Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TIPS.map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{tip.icon}</span>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)] mb-0.5">{tip.title}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TIPS = [
  {
    icon: '📦',
    title: 'Isolated Document Sets',
    desc: 'Each workspace has its own vector collection. Documents in one workspace are never mixed with another.',
  },
  {
    icon: '💬',
    title: 'Scoped Conversations',
    desc: 'Chats created in a workspace only show conversations from that workspace — clean history per project.',
  },
  {
    icon: '🔀',
    title: 'Instant Switching',
    desc: 'Switch workspaces instantly from the sidebar. Your RAG context updates immediately.',
  },
];
