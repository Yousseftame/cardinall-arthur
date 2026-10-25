import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import cardFront from '../../assets/CARD1.jpeg';
import { submitClubAdvanceRequest } from '../../services/clubAdvance.service';

export interface ClubAdvanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormFields = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

const EMPTY_FORM: FormFields = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string) {
  return value.replace(/[\s\-().]/g, '');
}

function validateForm(data: FormFields): FieldErrors {
  const errors: FieldErrors = {};
  const name = data.name.trim();
  const phone = normalizePhone(data.phone);
  const email = data.email.trim();
  const address = data.address.trim();

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Please enter your full name.';
  }

  if (!phone) {
    errors.phone = 'WhatsApp phone number is required.';
  } else if (!/^\+?\d{10,15}$/.test(phone)) {
    errors.phone = 'Enter a valid phone number (10–15 digits).';
  }

  if (email && !EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!address) {
    errors.address = 'Full address is required.';
  } else if (address.length < 8) {
    errors.address = 'Please enter a more complete address.';
  }

  return errors;
}

function fieldClass(hasError: boolean) {
  return [
    'w-full px-4 py-3 rounded-xl bg-[#F8F7F3] text-[#2C0E11] placeholder:text-gray-400 text-sm focus:outline-none transition-colors',
    hasError
      ? 'border border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300'
      : 'border border-gray-200 focus:border-[#B28558] focus:ring-1 focus:ring-[#B28558]/30',
  ].join(' ');
}

export default function ClubAdvanceRequestModal({
  isOpen,
  onClose,
}: ClubAdvanceRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
      setIsSubmitting(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const updateField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await submitClubAdvanceRequest({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-advance-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[440px] bg-white rounded-3xl border border-gray-100 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] p-6 sm:p-8 text-[#2C0E11] animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="pt-6 pb-2 sm:pt-7 space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className="relative mx-auto w-[72%] max-w-[220px]">
              <div className="relative rounded-[14px] bg-white p-[3px] shadow-[0_16px_36px_-12px_rgba(44,14,17,0.45)] ring-1 ring-[#2C0E11]/8">
                <div className="relative aspect-[1.586/1] rounded-[11px] overflow-hidden">
                  <img
                    src={cardFront}
                    alt="Cardinal Arthur Club membership card"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-[1.1] select-none"
                    draggable={false}
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md text-[#2C0E11] flex items-center justify-center">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-2 px-2 pt-3">
              <h3 className="font-heading text-xl sm:text-2xl uppercase font-light tracking-tight text-[#2C0E11]">
                Request received
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                Thank you. Our team will contact you shortly on WhatsApp to confirm your Advance
                Membership and arrange payment.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide bg-[#2C0E11] hover:bg-[#3D1418] text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center pt-1 pb-4">
              <img
                src="/logo-removebg-preview.png"
                alt="Cardinal Arthur"
                className="h-12 sm:h-14 w-auto object-contain select-none"
              />
            </div>

            <div className="text-center space-y-2 mb-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#B28558] font-semibold">
                Advance Membership
              </p>
              <h3
                id="club-advance-title"
                className="font-heading text-2xl sm:text-[1.65rem] uppercase font-light tracking-tight text-[#2C0E11]"
              >
                Request Advance Card
              </h3>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-sm font-medium text-[#2C0E11]">1,000 EGP</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Free shipping on your first five orders after activation.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div>
                <label
                  htmlFor="club-name"
                  className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium"
                >
                  Full Name *
                </label>
                <input
                  id="club-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={fieldClass(!!errors.name)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="club-phone"
                  className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium"
                >
                  Phone Number (WhatsApp) *
                </label>
                <input
                  id="club-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+20 10 ..."
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={fieldClass(!!errors.phone)}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="club-email"
                  className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium"
                >
                  Email Address
                </label>
                <input
                  id="club-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={fieldClass(!!errors.email)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="club-address"
                  className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium"
                >
                  Full Address *
                </label>
                <textarea
                  id="club-address"
                  rows={2}
                  autoComplete="street-address"
                  placeholder="City, area, street, building"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={`${fieldClass(!!errors.address)} resize-none`}
                  aria-invalid={!!errors.address}
                />
                {errors.address && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="club-notes"
                  className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium"
                >
                  Notes
                </label>
                <textarea
                  id="club-notes"
                  rows={2}
                  placeholder="Any additional preferences (optional)"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className={`${fieldClass(false)} resize-none`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide bg-[#2C0E11] hover:bg-[#3D1418] text-white shadow-[0_10px_24px_-10px_rgba(44,14,17,0.55)] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
