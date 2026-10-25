import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ImageIcon, X } from 'lucide-react';
import {
  DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY,
  MARKETPLACE_BANNER_IMAGES,
} from '../../data/marketplaceBannerImages';
import type { BannerInput } from '../../services/banners.service';

export type BannerFormValues = BannerInput;

export interface BannerFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<BannerFormValues>;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: BannerFormValues) => void | Promise<void>;
}

const inputClass =
  'w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60';

export default function BannerFormModal({
  isOpen,
  mode,
  initialValues,
  isLoading = false,
  onClose,
  onSubmit,
}: BannerFormModalProps) {
  const [name, setName] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [imageKey, setImageKey] = useState(DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name || '');
    setHeading(initialValues?.heading || '');
    setDescription(initialValues?.description || '');
    setImageKey(initialValues?.imageKey || DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY);
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

  const headingLabel = mode === 'create' ? 'New Banner' : 'Edit Banner';
  const confirmText = mode === 'create' ? 'Create Banner' : 'Save Changes';
  const selectedImage = MARKETPLACE_BANNER_IMAGES.find((img) => img.key === imageKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const n = name.trim();
    const h = heading.trim();
    const d = description.trim();
    if (!n) {
      setError('Name is required.');
      return;
    }
    if (!h) {
      setError('Heading is required.');
      return;
    }
    if (!d) {
      setError('Description is required.');
      return;
    }
    if (!imageKey) {
      setError('Please choose an image.');
      return;
    }

    setError('');
    await onSubmit({
      name: n,
      heading: h,
      description: d,
      imageKey,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[640px] max-h-[92dvh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center mb-4">
          <ImageIcon className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">
            {headingLabel}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Shows in the Marketplace banner carousel, in the order set in the list.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="banner-name"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Name (badge)
            </label>
            <input
              id="banner-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New Arrivals"
              disabled={isLoading}
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="banner-heading"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Heading
            </label>
            <textarea
              id="banner-heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder={'AUTUMN\nWINTER\nESSENTIALS'}
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 resize-none uppercase"
            />
            <p className="text-[11px] text-gray-400">
              One line per display row (same stacked heading style as Marketplace).
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="banner-description"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Description
            </label>
            <textarea
              id="banner-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the banner description..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 resize-none"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Image — choose from assets
            </span>

            {selectedImage && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[#0E1011]">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold tracking-wide">
                  {selectedImage.label}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MARKETPLACE_BANNER_IMAGES.map((img) => {
                const selected = img.key === imageKey;
                return (
                  <button
                    key={img.key}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setImageKey(img.key)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all disabled:opacity-60 cursor-pointer ${
                      selected
                        ? 'border-[#2C0E11] ring-2 ring-[#2C0E11]/20'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    title={img.label}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#2C0E11] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[9px] font-semibold px-1 py-0.5 truncate">
                      {img.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
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
