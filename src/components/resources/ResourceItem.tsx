import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Trash2, Pencil, Check, X } from 'lucide-react';
import type { Resource } from '../../lib/types';
import { RESOURCE_TYPE_LABELS } from '../../lib/types';
import { isValidUrl, formatDate, cn } from '../../lib/utils';
import { updateResource, deleteResource } from '../../db/hooks';

const MAX_NOTE_BYTES = 10_000;

interface ResourceItemProps {
  resource: Resource;
  onDelete: (id: number) => void;
}

export function ResourceItem({ resource, onDelete }: ResourceItemProps) {
  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(resource.url || '');
  const [editNotes, setEditNotes] = useState(resource.notes || '');
  const [editTitle, setEditTitle] = useState(resource.title);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const startEditing = () => {
    setEditUrl(resource.url || '');
    setEditNotes(resource.notes || '');
    setEditTitle(resource.title);
    setUrlError(null);
    setNotesError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setUrlError(null);
    setNotesError(null);
  };

  const saveEditing = async () => {
    const urlRequired = resource.resourceType !== 'note';

    if (urlRequired && !editUrl.trim()) {
      setUrlError('URL is required');
      return;
    }
    if (editUrl.trim() && !isValidUrl(editUrl.trim())) {
      setUrlError('Enter a valid http:// or https:// URL');
      return;
    }

    const notesBytes = new TextEncoder().encode(editNotes).length;
    if (notesBytes > MAX_NOTE_BYTES) {
      setNotesError(`Notes exceed ${MAX_NOTE_BYTES.toLocaleString()} byte limit`);
      return;
    }

    await updateResource(resource.id!, {
      title: editTitle.trim() || resource.title,
      url: editUrl.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    await deleteResource(resource.id!);
    onDelete(resource.id!);
  };

  if (editing) {
    return (
      <div className="border border-brand-200 rounded-lg p-3 space-y-2 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/20">
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600"
          placeholder="Title"
        />
        <input
          type="url"
          value={editUrl}
          onChange={(e) => {
            setEditUrl(e.target.value);
            setUrlError(null);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800',
            urlError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600',
          )}
          placeholder="https://"
        />
        {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">Notes</span>
            <span
              className={cn(
                'text-xs',
                new TextEncoder().encode(editNotes).length > MAX_NOTE_BYTES
                  ? 'text-red-500'
                  : 'text-gray-400',
              )}
            >
              {new TextEncoder().encode(editNotes).length} / {MAX_NOTE_BYTES.toLocaleString()} B
            </span>
          </div>
          <textarea
            value={editNotes}
            onChange={(e) => {
              setEditNotes(e.target.value);
              setNotesError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEditing();
            }}
            rows={2}
            className={cn(
              'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mt-1 dark:bg-gray-800',
              notesError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600',
            )}
          />
          {notesError && <p className="text-xs text-red-500 mt-1">{notesError}</p>}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={cancelEditing}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={saveEditing}
            className="p-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {RESOURCE_TYPE_LABELS[resource.resourceType]}
          </span>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline inline-flex items-center gap-1 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {resource.title}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {!resource.url && (
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {resource.title}
            </span>
          )}
        </div>
        {resource.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {resource.notes}
          </p>
        )}
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">
          {formatDate(resource.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={startEditing}
          className="p-1 text-gray-400 hover:text-brand-600 dark:text-gray-500"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
