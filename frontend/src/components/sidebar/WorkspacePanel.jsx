import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../store/WorkspaceContext';

/**
 * Color palette mapping — matches backend palette keys.
 */
const COLOR_MAP = {
  violet:  { ring: 'ring-violet-500',  bg: 'bg-violet-500',  text: 'text-violet-400',  dot: 'bg-violet-500'  },
  blue:    { ring: 'ring-blue-500',    bg: 'bg-blue-500',    text: 'text-blue-400',    dot: 'bg-blue-500'    },
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  rose:    { ring: 'ring-rose-500',    bg: 'bg-rose-500',    text: 'text-rose-400',    dot: 'bg-rose-500'    },
  amber:   { ring: 'ring-amber-500',   bg: 'bg-amber-500',   text: 'text-amber-400',   dot: 'bg-amber-500'   },
  cyan:    { ring: 'ring-cyan-500',    bg: 'bg-cyan-500',    text: 'text-cyan-400',    dot: 'bg-cyan-500'    },
  pink:    { ring: 'ring-pink-500',    bg: 'bg-pink-500',    text: 'text-pink-400',    dot: 'bg-pink-500'    },
  indigo:  { ring: 'ring-indigo-500',  bg: 'bg-indigo-500',  text: 'text-indigo-400',  dot: 'bg-indigo-500'  },
};

const COLOR_OPTIONS = Object.keys(COLOR_MAP);

function getColor(key) {
  return COLOR_MAP[key] || COLOR_MAP.violet;
}

/**
 * Inline edit form inside the dropdown.
 */
function WorkspaceEditForm({ workspace, onSave, onCancel }) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim(), description.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1 space-y-2" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workspace name"
        maxLength={100}
        className="w-full px-2.5 py-1.5 rounded-lg text-xs
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                   text-[var(--color-text-primary)] focus:outline-none
                   focus:border-[var(--color-accent-primary)]"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={200}
        className="w-full px-2.5 py-1.5 rounded-lg text-xs
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                   text-[var(--color-text-primary)] focus:outline-none
                   focus:border-[var(--color-accent-primary)]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-1 rounded-lg text-xs font-medium
                     bg-[var(--color-accent-primary)] text-white
                     hover:opacity-90 disabled:opacity-40 cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1 rounded-lg text-xs font-medium
                     bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]
                     hover:bg-[var(--color-bg-hover)] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * "Create new workspace" inline form.
 */
function CreateWorkspaceForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('violet');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim(), description.trim(), color);
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--color-border-primary)] mt-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] pt-1">
        New Workspace
      </p>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name *"
        maxLength={100}
        className="w-full px-2.5 py-1.5 rounded-lg text-xs
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                   text-[var(--color-text-primary)] focus:outline-none
                   focus:border-[var(--color-accent-primary)]"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={200}
        className="w-full px-2.5 py-1.5 rounded-lg text-xs
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]
                   text-[var(--color-text-primary)] focus:outline-none
                   focus:border-[var(--color-accent-primary)]"
      />
      {/* Color picker */}
      <div className="flex gap-1.5 flex-wrap">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full ${getColor(c).bg} cursor-pointer
                        transition-transform hover:scale-110
                        ${color === c ? 'ring-2 ring-offset-1 ring-offset-[var(--color-bg-secondary)] ' + getColor(c).ring : ''}`}
            title={c}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-1 rounded-lg text-xs font-medium
                     bg-[var(--color-accent-primary)] text-white
                     hover:opacity-90 disabled:opacity-40 cursor-pointer"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1 rounded-lg text-xs font-medium
                     bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]
                     hover:bg-[var(--color-bg-hover)] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * A single workspace row in the dropdown list.
 */
function WorkspaceRow({ workspace, isActive, onSelect, onEdit, onDelete, canDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = getColor(workspace.color);

  const handleSave = async (name, description) => {
    await onEdit(workspace.id, name, description);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`rounded-xl overflow-hidden border ${isActive ? 'border-[var(--color-border-accent)]' : 'border-[var(--color-border-primary)]'}`}>
        <WorkspaceEditForm
          workspace={workspace}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(workspace.id)}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-150
                  ${isActive
                    ? 'bg-[var(--color-accent-glow)] border border-[var(--color-border-accent)]'
                    : 'hover:bg-[var(--color-bg-hover)] border border-transparent'
                  }`}
    >
      {/* Color dot */}
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isActive ? color.text : 'text-[var(--color-text-primary)]'}`}>
          {workspace.name}
        </p>
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          {workspace.document_count} doc{workspace.document_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          title="Rename"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        {canDelete && (
          <button
            onClick={() => {
              if (confirmDelete) { onDelete(workspace.id); setConfirmDelete(false); }
              else setConfirmDelete(true);
            }}
            onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
            className={`p-1 rounded-md cursor-pointer transition-colors
                        ${confirmDelete
                          ? 'bg-red-500/20 text-red-400'
                          : 'hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:text-red-400'
                        }`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * WorkspacePanel — sits at the top of the sidebar.
 * Shows the active workspace with a dropdown to switch / manage workspaces.
 */
export default function WorkspacePanel() {
  const {
    workspaces,
    activeWorkspace,
    changeWorkspace,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
    loading,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeColor = getColor(activeWorkspace?.color);

  const handleSelect = (id) => {
    changeWorkspace(id);
    setOpen(false);
    setCreating(false);
  };

  const handleCreate = async (name, description, color) => {
    await addWorkspace(name, description, color);
    setCreating(false);
    setOpen(false);
  };

  return (
    <div ref={panelRef} className="relative px-3 mb-2">
      {/* Active workspace trigger */}
      <button
        id="workspace-switcher"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                    border transition-all duration-150 cursor-pointer
                    ${open
                      ? 'border-[var(--color-border-accent)] bg-[var(--color-accent-glow)]'
                      : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)]'
                    }`}
      >
        {loading ? (
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-bg-elevated)] animate-pulse" />
        ) : (
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeColor.dot}`} />
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-xs font-semibold truncate ${activeColor.text}`}>
            {loading ? 'Loading…' : (activeWorkspace?.name || 'No Workspace')}
          </p>
          {activeWorkspace && (
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              {activeWorkspace.document_count ?? 0} doc{activeWorkspace.document_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-[var(--color-text-tertiary)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50
                        bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]
                        rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {/* Workspace list */}
          <div className="p-2 space-y-0.5 max-h-60 overflow-y-auto">
            {workspaces.map((ws) => (
              <WorkspaceRow
                key={ws.id}
                workspace={ws}
                isActive={ws.id === activeWorkspace?.id}
                onSelect={handleSelect}
                onEdit={editWorkspace}
                onDelete={removeWorkspace}
                canDelete={workspaces.length > 1}
              />
            ))}
          </div>

          {/* Create new workspace */}
          {creating ? (
            <CreateWorkspaceForm
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <div className="border-t border-[var(--color-border-primary)] p-2">
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                           text-xs text-[var(--color-text-secondary)]
                           hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]
                           transition-colors duration-150 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Workspace
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
