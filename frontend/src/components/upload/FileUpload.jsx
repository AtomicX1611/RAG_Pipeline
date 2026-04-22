import { useCallback, useRef, useState } from 'react';
import { formatFileSize } from '../../utils/formatters';

/**
 * Drag-and-drop file upload zone with file list.
 */
export default function FileUpload({
  uploadedFiles,
  onFilesSelected,
  onRemoveFile,
  onClearFiles,
  onUpload,
  uploading,
  uploadProgress,
  error,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected],
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files?.length) {
        onFilesSelected(e.target.files);
      }
    },
    [onFilesSelected],
  );

  return (
    <div className="animate-fade-in-up space-y-3" id="file-upload-zone">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${
                      dragActive
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]'
                        : 'border-[var(--color-border-hover)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)]'
                    }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200
                          ${dragActive ? 'bg-[var(--color-accent-primary)]/20' : 'bg-[var(--color-bg-elevated)]'}`}>
            <svg
              className={`w-6 h-6 transition-colors duration-200 ${
                dragActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-tertiary)]'
              }`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-accent-secondary)] font-medium">Click to upload</span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">PDF, TXT — up to 20MB</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          <svg className="w-4 h-4 text-[var(--color-error)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
                         bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]"
            >
              <span className="text-lg">
                {f.name.endsWith('.pdf') ? '📕' : '📄'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{f.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{formatFileSize(f.size)}</p>
              </div>
              <button
                onClick={() => onRemoveFile(f.id)}
                className="shrink-0 p-1 rounded-md hover:bg-[var(--color-bg-hover)]
                           text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]
                           transition-colors duration-150 cursor-pointer"
                aria-label={`Remove ${f.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Upload progress */}
          {uploading && uploadProgress !== null && (
            <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onUpload}
              disabled={uploading}
              className="flex-1 py-2 px-4 rounded-xl gradient-bg text-white text-sm font-medium
                         hover:opacity-90 transition-opacity duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              id="upload-files-button"
            >
              {uploading ? 'Uploading…' : `Upload ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`}
            </button>
            <button
              onClick={onClearFiles}
              disabled={uploading}
              className="py-2 px-4 rounded-xl border border-[var(--color-border-hover)]
                         text-[var(--color-text-secondary)] text-sm font-medium
                         hover:bg-[var(--color-bg-hover)] transition-colors duration-200
                         disabled:opacity-50 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
