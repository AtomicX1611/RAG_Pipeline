import { CHUNKING_STRATEGIES } from '../../utils/constants';

/**
 * Dropdown to select a chunking strategy, with descriptions.
 */
export default function ChunkingSelector({ value, onChange }) {
  const selected = CHUNKING_STRATEGIES.find((s) => s.id === value);

  return (
    <div className="space-y-2" id="chunking-selector">
      <label className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        Chunking Strategy
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]
                     text-sm rounded-xl px-3 py-2.5 pr-10
                     border border-[var(--color-border-primary)]
                     hover:border-[var(--color-border-hover)]
                     focus:border-[var(--color-accent-primary)] focus:outline-none
                     transition-colors duration-200 cursor-pointer"
        >
          {CHUNKING_STRATEGIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon}  {s.name}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Description of selected strategy */}
      {selected && (
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed pl-1">
          {selected.description}
        </p>
      )}
    </div>
  );
}
