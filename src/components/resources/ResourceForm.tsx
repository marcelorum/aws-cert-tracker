import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Plus, Check, ChevronDown } from 'lucide-react';
import type { ResourceType } from '../../lib/types';
import { RESOURCE_TYPE_LABELS } from '../../lib/types';
import { isValidUrl, cn } from '../../lib/utils';
import { addResource } from '../../db/hooks';

const MAX_NOTE_BYTES = 10_000;

interface ResourceFormProps {
  topicId: number;
}

export function ResourceForm({ topicId }: ResourceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceType>('article');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setNotes('');
    setUrlError(null);
    setNotesError(null);
    setResourceType('article');
  };

  const urlRequired = resourceType !== 'note';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    if (urlRequired && !url.trim()) {
      setUrlError('URL is required for this resource type');
      return;
    }
    if (url.trim() && !isValidUrl(url.trim())) {
      setUrlError('Enter a valid http:// or https:// URL');
      return;
    }

    // Validate notes size
    const notesBytes = new TextEncoder().encode(notes).length;
    if (notesBytes > MAX_NOTE_BYTES) {
      setNotesError(`Notes exceed ${MAX_NOTE_BYTES.toLocaleString()} byte limit`);
      return;
    }

    setSubmitting(true);
    try {
      await addResource({
        topicId,
        resourceType,
        title: title.trim() || RESOURCE_TYPE_LABELS[resourceType],
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Resource
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">New Resource</span>
        <button
          type="button"
          onClick={() => { resetForm(); setIsOpen(false); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
        <Select.Root
          value={resourceType}
          onValueChange={(v) => setResourceType(v as ResourceType)}
        >
          <Select.Trigger className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="w-4 h-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <Select.Viewport>
                {(Object.entries(RESOURCE_TYPE_LABELS) as [ResourceType, string][]).map(
                  ([key, label]) => (
                    <Select.Item
                      key={key}
                      value={key}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-brand-50 outline-none data-[state=checked]:bg-brand-50"
                    >
                      <Select.ItemText>{label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="w-4 h-4 text-brand-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ),
                )}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${RESOURCE_TYPE_LABELS[resourceType]} title`}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* URL */}
      {urlRequired && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError(null);
            }}
            placeholder="https://..."
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500',
              urlError ? 'border-red-400' : 'border-gray-300',
            )}
          />
          {urlError && (
            <p className="mt-1 text-xs text-red-500">{urlError}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500">Notes</label>
          <span
            className={cn(
              'text-xs',
              new TextEncoder().encode(notes).length > MAX_NOTE_BYTES
                ? 'text-red-500'
                : 'text-gray-400',
            )}
          >
            {new TextEncoder().encode(notes).length} / {MAX_NOTE_BYTES.toLocaleString()} bytes
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesError(null);
          }}
          rows={3}
          placeholder="Optional notes or key takeaways..."
          className={cn(
            'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none',
            notesError ? 'border-red-400' : 'border-gray-300',
          )}
        />
        {notesError && (
          <p className="mt-1 text-xs text-red-500">{notesError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 px-4 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Saving...' : 'Save Resource'}
      </button>
    </form>
  );
}
