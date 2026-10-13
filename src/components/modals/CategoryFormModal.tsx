import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag } from 'lucide-react';
import type { CategoryStatus } from '../../services/categories.service';
import { cn } from '../../lib/utils';

export interface CategoryFormValues {
  name: string;
  status: CategoryStatus;
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialName?: string;
  initialStatus?: CategoryStatus;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
}

export default function CategoryFormModal({
  isOpen,
  mode,
  initialName = '',
  initialStatus = 'active',
  isLoading = false,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<CategoryStatus>(initialStatus);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setStatus(initialStatus);
    }
  }, [isOpen, initialName, initialStatus]);

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

  const title = mode === 'create' ? 'Add Category' : 'Edit Category';
  const confirmText = mode === 'create' ? 'Create Category' : 'Save Changes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isLoading) return;
    await onSubmit({ name: trimmed, status });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[430px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] border border-gray-100 animate-in zoom-in-95 duration-200"
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
          <Tag className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Active categories appear in the marketplace filter. Inactive ones stay hidden.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Category Name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Winter"
              disabled={isLoading}
              autoFocus
              className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
            </span>
            <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setStatus('active')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  status === 'active'
                    ? "bg-[#2C0E11] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? "bg-[#C9A86A]" : "bg-gray-300")} />
                Active
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setStatus('inactive')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  status === 'inactive'
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", status === 'inactive' ? "bg-gray-400" : "bg-gray-300")} />
                Inactive
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
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
              disabled={isLoading || !name.trim()}
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
