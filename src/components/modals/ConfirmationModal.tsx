import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Icon styles based on variant
  const getIconContainer = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
        );
      case 'primary':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center mb-4">
            <Info className="w-6 h-6 stroke-[2]" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'primary':
      default:
        return 'bg-[#2C0E11] hover:bg-[#3D1418] text-white shadow-[#2C0E11]/20';
    }
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
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center sm:justify-start">
          {getIconContainer()}
        </div>

        {/* Title & Description */}
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">
            {title}
          </h3>
          {description && (
            <div className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
              {description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:flex-1 py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${getConfirmButtonClasses()}`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
