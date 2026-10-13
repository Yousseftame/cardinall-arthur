import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import PeekRating from '../PeekRating';
import { submitCheckoutFeedback } from '../../services/feedback.service';

interface CheckoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  customerName?: string;
  email?: string;
  phone?: string;
}

export default function CheckoutFeedbackModal({
  isOpen,
  onClose,
  orderNumber,
  customerName,
  email,
  phone,
}: CheckoutFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitCheckoutFeedback({
        orderNumber: orderNumber || 'GUEST',
        customerName: customerName || 'Valued Customer',
        email: email || '',
        phone: phone || '',
        rating,
        comment,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200 pt-24 sm:pt-28 pb-8 overflow-y-auto">
      <div 
        className="relative w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_-10px_rgba(44,14,17,0.18)] p-6 sm:p-7 text-center overflow-visible animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          /* Clean Success State */
          <div className="py-6 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#2C0E11]/8 text-[#2C0E11] mx-auto flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-semibold text-[#2C0E11]">
                Thank you for your feedback
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Your thoughts help us refine the Cardinall Arthur experience.
              </p>
            </div>
          </div>
        ) : (
          /* Classic Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Website Logo - Emblem Image Only, Prominent & Centered */}
            <div className="flex items-center justify-center pt-1 pb-0.5">
              <img 
                src="/logo-removebg-preview.png" 
                alt="Cardinal Arthur Logo" 
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs select-none"
              />
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-serif text-[#2C0E11] tracking-tight">
                How was your experience?
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                {customerName ? `Thank you, ${customerName}. ` : ''}Please share a quick rating of your checkout.
              </p>
            </div>

            {/* Smooth PeekRating Component - tighter balanced spacing to text */}
            <div className="-mt-6 sm:-mt-7 pt-0 pb-0.5 flex items-center justify-center">
              <PeekRating
                value={rating}
                onChange={setRating}
                count={5}
                shape="star"
                size={32}
                lift={8}
                magnify={1.18}
                activeColor="#C9A86A"
                idleColor="#DDD8D1"
                tipColor="#2C0E11"
                tipTextColor="#FFFFFF"
                labels={['Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional']}
                showTip={true}
                allowClear={false}
                className="mx-auto"
              />
            </div>

            {/* Comment Area */}
            <div className="pt-0">
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share any comments or suggestions (optional)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2C0E11] focus:bg-white transition-all resize-none shadow-2xs"
              />
            </div>

            {/* Full Width Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#2C0E11] text-white text-sm font-semibold hover:bg-[#3D1418] active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
