import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X } from 'lucide-react';

export interface TimelineFormValues {
  year: string;
  title: string;
  description: string;
}

export interface TimelineFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<TimelineFormValues>;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: TimelineFormValues) => void | Promise<void>;
}

export default function TimelineFormModal({
  isOpen,
  mode,
  initialValues,
  isLoading = false,
  onClose,
  onSubmit,
}: TimelineFormModalProps) {
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setYear(initialValues?.year || '');
    setTitle(initialValues?.title || '');
    setDescription(initialValues?.description || '');
    setError('');
  }, [isOpen, initialValues]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const heading = mode === 'create' ? 'New Milestone' : 'Edit Milestone';
  const confirmText = mode === 'create' ? 'Create Milestone' : 'Save Changes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const y = year.trim();
    const t = title.trim();
    const d = description.trim();
    if (!y) {
      setError('Year is required.');
      return;
    }
    if (!t) {
      setError('Title is required.');
      return;
    }
    if (!d) {
      setError('Description is required.');
      return;
    }

    setError('');
    await onSubmit({ year: y, title: t, description: d });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[520px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">{heading}</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Each milestone shows a title, year, and description along the journey line.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
            <div className="space-y-1.5">
              <label htmlFor="timeline-year" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Year
              </label>
              <input
                id="timeline-year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1997"
                disabled={isLoading}
                maxLength={12}
                autoFocus
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="timeline-title" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Title
              </label>
              <input
                id="timeline-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Where It Began."
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="timeline-description"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Description
            </label>
            <textarea
              id="timeline-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the milestone story..."
              disabled={isLoading}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#2C0E11] hover:bg-[#3D1418] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#2C0E11]/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
