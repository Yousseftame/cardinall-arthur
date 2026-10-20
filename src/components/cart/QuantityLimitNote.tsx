import toast from 'react-hot-toast';
import { MAX_QUANTITY_MESSAGE, MAX_QUANTITY_PER_PRODUCT } from '../../store/cartStore';

interface QuantityLimitNoteProps {
  /** Units already in the cart for this product, when relevant. */
  inCartQuantity?: number;
  className?: string;
}

/** Inline red note shown when a product hits the per-order maximum. */
export function QuantityLimitNote({
  inCartQuantity = 0,
  className = '',
}: QuantityLimitNoteProps) {
  return (
    <p
      role="alert"
      className={`text-[13px] font-medium leading-snug text-red-500 ${className}`}
    >
      {MAX_QUANTITY_MESSAGE}
      {inCartQuantity > 0 && inCartQuantity < MAX_QUANTITY_PER_PRODUCT
        ? ` — ${inCartQuantity} already in your cart`
        : inCartQuantity >= MAX_QUANTITY_PER_PRODUCT
          ? ' — already in your cart'
          : ''}
    </p>
  );
}

/** Red toast used by one-tap add buttons (cards, favorites) at the cap. */
export function notifyQuantityLimit(productName?: string) {
  toast.error(
    productName
      ? `${MAX_QUANTITY_MESSAGE} — ${productName}`
      : MAX_QUANTITY_MESSAGE,
    {
      style: {
        background: '#1a1a1a',
        color: '#ffffff',
        border: '1px solid rgba(239, 68, 68, 0.55)',
        borderRadius: '8px',
        padding: '14px 18px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#ffffff',
      },
    }
  );
}
