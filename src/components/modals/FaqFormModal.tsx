import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { MAX_SECTION_FAQS } from '../../services/faq.service';
import { cn } from '../../lib/utils';

export interface FaqFormValues {
  question: string;
  answer: string;
  featuredInSection: boolean;
}

export interface FaqFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<FaqFormValues>;
  featuredCount: number;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: FaqFormValues) => void | Promise<void>;
}

export default function FaqFormModal({
  isOpen,
  mode,
  initialValues,
  featuredCount,
  isLoading = false,
  onClose,
  onSubmit,
}: FaqFormModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [featuredInSection, setFeaturedInSection] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  const wasAlreadyFeatured = Boolean(initialValues?.featuredInSection);
  const canEnableFeatured =
    featuredInSection ||
    wasAlreadyFeatured ||
    featuredCount < MAX_SECTION_FAQS;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuestion(initialValues?.question || '');
    setAnswer(initialValues?.answer || '');
    setFeaturedInSection(Boolean(initialValues?.featuredInSection));
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

  const title = mode === 'create' ? 'New FAQ' : 'Edit FAQ';
  const confirmText = mode === 'create' ? 'Create FAQ' : 'Save Changes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const q = question.trim();
    const a = answer.trim();
    if (!q) {
      setError('Question is required.');
      return;
    }
    if (!a) {
      setError('Answer is required.');
      return;
    }
    if (featuredInSection && !wasAlreadyFeatured && featuredCount >= MAX_SECTION_FAQS) {
      setError(`Only ${MAX_SECTION_FAQS} FAQs can be marked for sections.`);
      return;
    }

    setError('');
    await onSubmit({ question: q, answer: a, featuredInSection });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] border border-gray-100 animate-in zoom-in-95 duration-200"
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
          <HelpCircle className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Mark up to {MAX_SECTION_FAQS} FAQs to show in page sections. All FAQs appear on the FAQ page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="faq-question" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Question
            </label>
            <input
              id="faq-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Do you offer international shipping?"
              disabled={isLoading}
              autoFocus
              className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="faq-answer" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Answer
            </label>
            <textarea
              id="faq-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a clear answer..."
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 resize-none"
            />
          </div>

          <button
            type="button"
            disabled={isLoading || (!featuredInSection && !canEnableFeatured)}
            onClick={() => {
              if (!featuredInSection && !canEnableFeatured) return;
              setFeaturedInSection((v) => !v);
            }}
            className={cn(
              'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              featuredInSection
                ? 'bg-[#2C0E11]/5 border-[#2C0E11]/20'
                : 'bg-[#F4F4F4] border-transparent hover:bg-gray-100'
            )}
          >
            <div>
              <p className="text-sm font-semibold text-[#2C0E11]">Show in page sections</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {featuredCount}/{MAX_SECTION_FAQS} slots used
              </p>
            </div>
            <span
              className={cn(
                'w-10 h-6 rounded-full relative transition-colors shrink-0',
                featuredInSection ? 'bg-[#2C0E11]' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  featuredInSection ? 'translate-x-4' : 'translate-x-0.5'
                )}
              />
            </span>
          </button>

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
