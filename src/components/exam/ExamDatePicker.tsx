import { useState, useCallback } from 'react';
import { Calendar, X } from 'lucide-react';
import { useExamSchedule } from '../../db/hooks';

function parseShortDate(value: string): string | null {
  // Accept DD/MM/YY, DD/MM/YYYY, DDMMYY, DDMMYYYY
  const digits = value.replace(/\D/g, '');
  if (digits.length < 6) return null;

  let dd: string, mm: string, yyyy: string;

  if (digits.length === 6) {
    // DDMMYY → 20YY-MM-DD
    dd = digits.slice(0, 2);
    mm = digits.slice(2, 4);
    yyyy = '20' + digits.slice(4, 6);
  } else if (digits.length >= 8) {
    // DDMMYYYY → YYYY-MM-DD
    dd = digits.slice(0, 2);
    mm = digits.slice(2, 4);
    yyyy = digits.slice(4, 8);
  } else {
    return null;
  }

  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);

  if (year < 2024 || year > 2099) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Validate via Date object
  const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  // Check that the parsed components match (catches invalid dates like Feb 30)
  if (d.getDate() !== day || d.getMonth() + 1 !== month || d.getFullYear() !== year) return null;

  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(isoDate: string | null): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
  const yyyy = isoDate.slice(0, 4);
  const mm = isoDate.slice(5, 7);
  const dd = isoDate.slice(8, 10);
  return `${dd}/${mm}/${yyyy.slice(2)}`; // DD/MM/YY
}

export function ExamDatePicker() {
  const { targetDate, setTargetDate, clearTargetDate } = useExamSchedule();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((value: string) => {
    setRaw(value);
    setError('');

    const parsed = parseShortDate(value);
    if (parsed) {
      setTargetDate(parsed);
      setRaw(''); // clear input after successful parse
    }
  }, [setTargetDate]);

  const displayValue = raw || formatDisplay(targetDate);

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YY"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-28 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
      {targetDate && !raw && (
        <button
          onClick={() => { clearTargetDate(); setRaw(''); }}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Clear exam date"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}