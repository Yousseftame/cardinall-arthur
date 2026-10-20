import React, { useState, useEffect, useRef } from 'react';
import {
  getCartTotalQuantity,
  MAX_QUANTITY_MESSAGE,
  MAX_QUANTITY_PER_PRODUCT,
  useCartStore,
} from '../../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { createOrder, generateOrderNumber } from '../../services/orders.service';
import { getCheckoutSettings } from '../../services/checkoutSettings.service';
import { savePaidCustomer } from '../../services/paidCustomers.service';
import type { CreateOrderInput } from '../../types/order';
import { Copy, Check, CreditCard } from 'lucide-react';
import HoldButton from '../../components/HoldButton';
import visaImg from '../../assets/visa.png';
import mastercardImg from '../../assets/mastercard.svg';
import omannetImg from '../../assets/omannet.DA0vueZ7.svg';

const FloatingInput = ({ label, className = "", id, icon, ...props }: any) => {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        className={`block w-full px-3.5 pb-2 pt-5 text-sm text-gray-900 bg-white border rounded-md appearance-none focus:outline-none focus:ring-1 peer placeholder-transparent transition-all ${icon ? 'pr-10' : ''} border-gray-200 focus:border-blue-500 focus:ring-blue-500 group-[.is-submitted]:invalid:border-red-500 group-[.is-submitted]:invalid:focus:border-red-500 group-[.is-submitted]:invalid:focus:ring-red-500`}
        placeholder={label}
        {...props}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (props.type === 'tel') {
            e.target.value = e.target.value.replace(/[^0-9+\-\s]/g, '');
          }
          if (props.onInput) {
            props.onInput(e);
          }
        }}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-200 transform -translate-y-2.5 scale-[0.80] top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.80] peer-focus:-translate-y-2.5 cursor-text group-[.is-submitted]:peer-invalid:text-red-500"
      >
        {label}
      </label>
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );
};

const FloatingSelect = ({ label, className = "", id, children, ...props }: any) => {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        className="block w-full px-3.5 pb-2 pt-5 text-sm text-gray-900 bg-white border rounded-md appearance-none focus:outline-none focus:ring-1 transition-all cursor-pointer peer border-gray-200 focus:border-blue-500 focus:ring-blue-500 group-[.is-submitted]:invalid:border-red-500 group-[.is-submitted]:invalid:focus:border-red-500 group-[.is-submitted]:invalid:focus:ring-red-500"
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 transform -translate-y-2.5 scale-[0.80] top-4 z-10 origin-[0] left-3 pointer-events-none group-[.is-submitted]:peer-invalid:text-red-500"
      >
        {label}
      </label>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
};

const Checkbox = ({ id, label, checked, onChange, disabled }: any) => (
  <div className={`flex items-center gap-3 mt-3 mb-1 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
    <input 
      id={id} 
      type="checkbox" 
      checked={checked}
      onChange={disabled ? undefined : onChange}
      readOnly={disabled}
      className={`w-[18px] h-[18px] rounded focus:ring-offset-0 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`} 
    />
    <label htmlFor={id} className={`text-sm text-gray-700 select-none ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}>{label}</label>
  </div>
);

const RadioBox = ({ id, label, description, price, rightElement, checked, onChange, children, contentClassName = "" }: any) => (
  <div className={`border rounded-md cursor-pointer transition-all ${checked ? 'border-blue-500 bg-[#f4f8fd]' : 'border-gray-200 bg-white hover:border-gray-300'}`} onClick={() => onChange(id)}>
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
          {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
        </div>
        <div>
          <div className="text-[13px] sm:text-sm text-gray-900 font-medium">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
      </div>
      {price && (
        <div className="text-sm text-gray-900 font-medium">{price}</div>
      )}
      {rightElement && (
        <div className="flex items-center gap-1.5 shrink-0 ml-2">{rightElement}</div>
      )}
    </div>
    {checked && children && (
      <div className={`px-4 pb-4 pt-4 border-t border-blue-500/10 rounded-b-md ${contentClassName}`}>
        {children}
      </div>
    )}
  </div>
);

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getCartTotal();
  const cartCount = getCartTotalQuantity(items);

  // Load checkout settings from Firestore
  const { data: checkoutSettings } = useQuery({
    queryKey: ['checkout-settings'],
    queryFn: getCheckoutSettings,
    staleTime: 1000 * 5, // 5 seconds fresh
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('Giza');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [billingSame, setBillingSame] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    firstName: string;
    orderNumber: string;
    total: number;
    itemsCount: number;
    governorate: string;
    address: string;
    paymentMethod: string;
  } | null>(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // 1. Default Shipping Fee from Admin Settings
  const defaultShippingFee = typeof checkoutSettings?.standardShippingFee === 'number'
    ? checkoutSettings.standardShippingFee
    : 80;

  // Full governorates list from Admin Settings
  const allGovernorates = checkoutSettings?.governorates && checkoutSettings.governorates.length > 0
    ? checkoutSettings.governorates
    : [
        { id: 'cairo', name: 'Cairo', shippingFee: 60, active: true },
        { id: 'giza', name: 'Giza', shippingFee: 80, active: true },
        { id: 'alexandria', name: 'Alexandria', shippingFee: 90, active: true },
        { id: 'qalyubia', name: 'Qalyubia', shippingFee: 80, active: true },
        { id: 'sharqia', name: 'Sharqia', shippingFee: 90, active: true },
        { id: 'dakahlia', name: 'Dakahlia', shippingFee: 90, active: true },
        { id: 'red-sea', name: 'Red Sea', shippingFee: 130, active: true },
      ];

  // Active governorates based on "Delivery Status"
  const activeGovernorates = allGovernorates.filter(g => g.active);
  const hasActiveGovernorates = activeGovernorates.length > 0;

  // Scenario:
  // - If there are available governorates (Delivery Status = Available), display them with their rates.
  // - If ALL of them are disabled, the "Default Shipping Fee" is considered and displays for all governorates.
  const displayGovernorates = hasActiveGovernorates
    ? activeGovernorates
    : allGovernorates.map(g => ({ ...g, shippingFee: defaultShippingFee }));

  const matchedGov = displayGovernorates.find(g => g.name.toLowerCase() === selectedGovernorate.toLowerCase());
  const baseShippingFee = hasActiveGovernorates
    ? (matchedGov ? matchedGov.shippingFee : displayGovernorates[0]?.shippingFee ?? defaultShippingFee)
    : defaultShippingFee;

  // 2. Free Shipping Minimum Threshold (0 means disabled)
  const freeThreshold = typeof checkoutSettings?.freeShippingThreshold === 'number'
    ? checkoutSettings.freeShippingThreshold
    : 0;
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const shipping = subtotal > 0 ? (isFreeShipping ? 0 : baseShippingFee) : 0;
  const total = subtotal + shipping;

  // 3. Estimated Delivery Time
  const deliveryTime = checkoutSettings?.deliveryTimeEstimate?.trim() || "1 to 3 business days";

  // Auto-sync selected governorate if it's no longer available in displayGovernorates
  useEffect(() => {
    if (displayGovernorates.length > 0) {
      const match = displayGovernorates.some(g => g.name.toLowerCase() === selectedGovernorate.toLowerCase());
      if (!match) {
        setSelectedGovernorate(displayGovernorates[0].name);
      }
    }
  }, [displayGovernorates, selectedGovernorate]);

  const firstItem = items[0];

  useEffect(() => {
    if (items.length === 0 && !orderSuccessData) {
      navigate('/marketplace');
    }
  }, [items, navigate, orderSuccessData]);

  useEffect(() => {
    if (orderSuccessData) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [orderSuccessData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError(null);
    
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setFormError('Please complete all required fields correctly to proceed.');
      toast.error('Please complete all required fields correctly to proceed.', {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500'
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#ffffff',
        },
      });
      const firstInvalid = form.querySelector(':invalid') as HTMLElement;
      firstInvalid?.focus();
      return;
    }

    // Defense in depth: cart store already caps at 3, never submit over-limit.
    const overLimitItem = items.find(
      (item) =>
        !Number.isFinite(item.quantity) ||
        item.quantity > MAX_QUANTITY_PER_PRODUCT
    );
    if (overLimitItem) {
      const message = `${MAX_QUANTITY_MESSAGE} — ${overLimitItem.name}`;
      setFormError(message);
      toast.error(message, {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#ffffff',
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const firstNameInput = form.querySelector('#firstName') as HTMLInputElement;
      const lastNameInput = form.querySelector('#lastName') as HTMLInputElement;
      const emailInput = form.querySelector('#email') as HTMLInputElement;
      const phoneInput = form.querySelector('#phone') as HTMLInputElement;
      const additionalPhoneInput = form.querySelector('#additionalPhone') as HTMLInputElement;
      const addressInput = form.querySelector('#address') as HTMLInputElement;
      const streetInput = form.querySelector('#street') as HTMLInputElement;
      const buildingInput = form.querySelector('#building') as HTMLInputElement;
      const apartmentInput = form.querySelector('#apartment') as HTMLInputElement;
      const areaInput = form.querySelector('#area') as HTMLInputElement;
      const postalCodeInput = form.querySelector('#postalCode') as HTMLInputElement;
      const notesInput = form.querySelector('#notes') as HTMLInputElement;
      const emailOffersInput = form.querySelector('#emailOffers') as HTMLInputElement;

      const firstName = firstNameInput?.value?.trim() || 'Customer';
      const lastName = lastNameInput?.value?.trim() || '';
      const email = emailInput?.value?.trim() || '';
      const phone = phoneInput?.value?.trim() || '';
      const additionalPhone = additionalPhoneInput?.value?.trim() || '';
      const address = addressInput?.value?.trim() || '';
      const street = streetInput?.value?.trim() || '';
      const building = buildingInput?.value?.trim() || '';
      const apartment = apartmentInput?.value?.trim() || '';
      const area = areaInput?.value?.trim() || '';
      const postalCode = postalCodeInput?.value?.trim() || '';
      const notes = notesInput?.value?.trim() || '';
      const emailOffers = emailOffersInput ? emailOffersInput.checked : true;

      const orderPayload: CreateOrderInput = {
        orderNumber: generateOrderNumber(),
        customer: {
          firstName,
          lastName,
          email,
          phone,
          ...(additionalPhone ? { additionalPhone } : {}),
        },
        shippingAddress: {
          governorate: selectedGovernorate,
          area,
          street,
          building,
          apartment,
          fullAddress: address,
          ...(postalCode ? { postalCode } : {}),
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          subtotal: item.price * item.quantity,
        })),
        pricing: {
          subtotal,
          shippingFee: shipping,
          discount: 0,
          total,
          currency: 'EGP',
        },
        paymentMethod: paymentMethod as 'cod' | 'card',
        paymentStatus: 'pending',
        status: 'pending',
        notes: notes || undefined,
        emailOffers,
      };

      const created = await createOrder(orderPayload);

      // Save paid customer contact (name, email, phone only)
      try {
        await savePaidCustomer({
          name: `${firstName} ${lastName}`.trim() || firstName,
          email,
          phone,
        });
      } catch (e) {
        console.warn('Failed to save paid customer:', e);
      }

      // Store pending feedback for when customer returns to Home page
      try {
        localStorage.setItem('pending_checkout_feedback', JSON.stringify({
          orderNumber: created.orderNumber,
          customerName: `${firstName} ${lastName}`.trim() || firstName,
          email,
          phone,
          placedAt: Date.now(),
        }));
      } catch (e) {
        console.warn('Failed to save pending feedback:', e);
      }

      toast.success('Order placed successfully!', {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500'
        },
        iconTheme: {
          primary: '#83BF6E',
          secondary: '#ffffff',
        },
      });

      setOrderSuccessData({
        firstName,
        orderNumber: created.orderNumber,
        total,
        itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
        governorate: selectedGovernorate,
        address,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Card Payment'
      });
      clearCart();
    } catch (err: any) {
      console.error("Order submission error:", err);
      const msg = err?.message || 'Failed to place order. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CartSummaryContent = () => (
    <>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-white border border-gray-200/80 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-[85%] h-[85%] object-contain"
                />
              </div>
              <div className="absolute -top-2.5 -right-2.5 min-w-[20px] h-[20px] px-1 bg-[#2C0E11] text-white rounded-[8px] ring-2 ring-[#f5f5f5] flex items-center justify-center text-[11px] font-bold shadow-sm">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium text-gray-900 flex-shrink-0">
              {(item.price * item.quantity).toFixed(2)} EGP
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 py-5 border-y border-gray-200/80">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal · {cartCount} items</span>
          <span className="font-medium text-gray-900">{subtotal.toFixed(2)} EGP</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>Shipping ({selectedGovernorate})</span>
            <div className="relative flex items-center group/shipping cursor-help">
              <svg className="w-[17px] h-[17px] text-gray-400 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full right-1/2 translate-x-[50%] mb-2.5 w-max bg-[#2C0E11] text-white text-[13px] font-medium leading-[1.4] text-center px-4 py-2.5 rounded-[10px] opacity-0 invisible group-hover/shipping:opacity-100 group-hover/shipping:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
                Standard delivery ({deliveryTime})
                <div className="absolute top-full right-1/2 translate-x-[50%] -mt-px border-[6px] border-transparent border-t-[#2C0E11]" />
              </div>
            </div>
          </div>
          <span className="font-medium text-gray-900">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
            ) : (
              `${shipping.toFixed(2)} EGP`
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <div className="flex items-end gap-1.5">
          <span className="text-[22px] font-semibold text-gray-900">{total.toFixed(2)}</span>
          <span className="text-sm font-medium text-gray-500 mb-1">EGP</span>
        </div>
      </div>
    </>
  );

  if (orderSuccessData) {
    return (
      <div className="min-h-screen bg-[#fcfbf8] flex flex-col items-center justify-start pt-32 sm:pt-40 md:pt-44 pb-20 px-4 sm:px-6 text-center font-sans">
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8F8EF] text-[#83BF6E] rounded-full flex items-center justify-center mb-4 sm:mb-5 shadow-xs">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2.5 sm:mb-3 border border-emerald-200">
            Order Submitted & Sent to Store
          </span>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Thank you, {orderSuccessData.firstName}!
          </h1>
          
          <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm leading-relaxed">
            Your order has been recorded in our system. You will receive updates as your order is processed.
          </p>

          <div className="w-full bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-200/70 mb-5 sm:mb-6 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
              <span className="text-[11px] sm:text-xs text-gray-500 font-bold uppercase">Order Reference</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-[#2C0E11]">{orderSuccessData.orderNumber}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(orderSuccessData.orderNumber);
                    setCopiedOrder(true);
                    setTimeout(() => setCopiedOrder(false), 2000);
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors cursor-pointer"
                  title="Copy order number"
                >
                  {copiedOrder ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Items Count:</span>
              <span className="font-bold text-gray-900">{orderSuccessData.itemsCount} pcs</span>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Total Amount:</span>
              <span className="font-bold text-gray-900">{orderSuccessData.total.toFixed(2)} EGP</span>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment Method:</span>
              <span className="font-semibold text-gray-800">{orderSuccessData.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Delivery Destination:</span>
              <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-[220px] text-right">
                {orderSuccessData.address}, {orderSuccessData.governorate}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <Link 
              to="/" 
              className="block w-full bg-[#2C0E11] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#2C0E11]/90 active:scale-[0.99] transition-all shadow-sm text-center cursor-pointer"
            >
              Return to Home
            </Link>
            <Link 
              to="/marketplace" 
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 active:scale-[0.99] transition-all text-center cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row min-h-screen font-sans bg-white">
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-[55%] xl:w-[55%] bg-white flex justify-end border-r border-gray-200/60">
        <div className="w-full max-w-2xl px-6 pt-28 pb-10 lg:px-12 lg:pt-36 xl:pr-16 xl:pl-10">
          
          {/* Logo / Header for mobile */}
          <div className="lg:hidden mb-6 flex justify-center border-b pb-6">
            <h1 className="text-2xl font-bold tracking-tighter uppercase text-[#1a1a1a]">Cardinall Arthur</h1>
          </div>



          <form ref={formRef} onSubmit={handleSubmit} className={`space-y-10 group ${hasSubmitted ? 'is-submitted' : ''}`} noValidate>
            
            {/* Contact Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
              </div>
              <FloatingInput 
                id="email" 
                label="Email" 
                type="email"
                autoComplete="email"
                required
                icon={
                  <div className="relative flex items-center group/tooltip cursor-help pointer-events-auto">
                    <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full -right-3 mb-2.5 w-[220px] bg-[#2C0E11] text-white text-[13px] font-medium leading-[1.4] text-center px-4 py-3.5 rounded-[10px] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-xl">
                      Used for your order confirmation and cart reminders
                      <div className="absolute top-full right-[16px] -mt-px border-[6px] border-transparent border-t-[#1a1a1a]" />
                    </div>
                  </div>
                }
              />
              <Checkbox 
                id="emailOffers" 
                label="Email me with news and offers" 
                checked={true}
                disabled={true}
              />
            </section>

            {/* Delivery Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h2>
              <div className="space-y-3.5">
                <FloatingSelect 
                  id="governorate" 
                  label="Governorate" 
                  value={selectedGovernorate}
                  onChange={(e: any) => setSelectedGovernorate(e.target.value)}
                >
                  {displayGovernorates.map((gov) => (
                    <option key={gov.id} value={gov.name}>
                      {gov.name} ({gov.shippingFee} EGP)
                    </option>
                  ))}
                </FloatingSelect>

                <div className="grid grid-cols-2 gap-3.5">
                  <FloatingInput id="firstName" label="First name" autoComplete="given-name" required minLength={2} />
                  <FloatingInput id="lastName" label="Last name" autoComplete="family-name" required minLength={2} />
                </div>

                <FloatingInput id="address" label="Full Address" autoComplete="street-address" required minLength={10} />

                <div className="grid grid-cols-3 gap-3.5">
                  <FloatingInput id="street" label="Street Name" required minLength={2} />
                  <FloatingInput id="building" label="Building No." required minLength={1} />
                  <FloatingInput id="apartment" label="Apartment No." required minLength={1} />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <FloatingInput id="area" label="Area (e.g. New Cairo)" required minLength={2} />
                  <FloatingInput id="postalCode" label="Postal code (optional)" autoComplete="postal-code" pattern="^[0-9A-Za-z\s\-]{3,10}$" title="Please enter a valid postal code" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <FloatingInput 
                    id="phone" 
                    label="Phone" 
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern="^[\+0-9\s\-]{10,20}$"
                    title="Please enter a valid phone number"
                    icon={
                      <div className="flex items-center gap-1.5 relative pointer-events-auto cursor-pointer group pr-2">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="w-[18px] h-[12px] bg-white border border-gray-200 flex flex-col shadow-sm rounded-sm overflow-hidden ml-1">
                          <div className="h-1/3 bg-[#ce1126]" />
                          <div className="h-1/3 bg-white flex items-center justify-center">
                             <div className="w-[3px] h-[3px] bg-[#c09300] rounded-full" />
                          </div>
                          <div className="h-1/3 bg-[#2C0E11]" />
                        </div>
                      </div>
                    }
                  />
                  <FloatingInput 
                    id="additionalPhone" 
                    label="Additional Phone (Optional)" 
                    type="tel" 
                    pattern="^[\+0-9\s\-]{10,20}$"
                    title="Please enter a valid phone number"
                    icon={
                      <div className="flex items-center gap-1.5 relative pointer-events-auto cursor-pointer group pr-2">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="w-[18px] h-[12px] bg-white border border-gray-200 flex flex-col shadow-sm rounded-sm overflow-hidden ml-1">
                          <div className="h-1/3 bg-[#ce1126]" />
                          <div className="h-1/3 bg-white flex items-center justify-center">
                             <div className="w-[3px] h-[3px] bg-[#c09300] rounded-full" />
                          </div>
                          <div className="h-1/3 bg-[#2C0E11]" />
                        </div>
                      </div>
                    }
                  />
                </div>

                <FloatingInput 
                  id="notes" 
                  label="Special delivery instructions or notes (optional)" 
                  placeholder="Special delivery instructions or notes (optional)"
                />
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping method</h2>
              <div className="bg-[#f4f8fd] border border-blue-500 rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium flex items-center gap-2">
                    <span>Shipping ({deliveryTime})</span>
                    {isFreeShipping && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Free Shipping
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{deliveryTime}</div>
                </div>
                <div>
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-xs text-gray-400 font-normal">{baseShippingFee.toFixed(2)} EGP</span>
                      <span className="text-sm font-bold text-emerald-700">FREE</span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{shipping.toFixed(2)} EGP</div>
                  )}
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</div>
              <div className="space-y-0 rounded-md overflow-hidden border border-gray-200">
                
                {/* Pay via Card */}
                <RadioBox 
                  id="card"
                  label="Pay via (Debit/Credit cards/Wallets/Installments)"
                  checked={paymentMethod === 'card'}
                  onChange={setPaymentMethod}
                  contentClassName="bg-[#f7f7f7] text-center py-8"
                  rightElement={
                    <>
                      <div className="bg-white border border-gray-200 rounded px-1.5 py-0.5 flex items-center justify-center h-[26px]">
                        <img src={omannetImg} alt="OmanNet" className="h-4 object-contain" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded px-1.5 py-0.5 flex items-center justify-center h-[26px]">
                        <img src={visaImg} alt="Visa" className="h-[20px] object-contain" />
                      </div>
                      <div className="bg-[#2C0E11] rounded px-1.5 py-0.5 flex items-center justify-center h-[26px]">
                        <img src={mastercardImg} alt="Mastercard" className="h-4 object-contain" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded px-1.5 py-0.5 flex items-center justify-center text-xs text-blue-600 h-[26px] font-medium leading-none">
                        +8
                      </div>
                    </>
                  }
                >
                  <p className="text-sm text-gray-700 px-4 leading-relaxed">
                    Coming soon
                  </p>
                </RadioBox>

                <div className="h-px w-full bg-gray-200" />

                {/* COD */}
                <RadioBox 
                  id="cod"
                  label="Cash on Delivery (COD)"
                  checked={paymentMethod === 'cod'}
                  onChange={setPaymentMethod}
                />

              </div>
            </section>

            {/* Billing Address */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing address</h2>
              <div className="space-y-0 rounded-md overflow-hidden border border-gray-200">
                <RadioBox 
                  id="same"
                  label="Same as shipping address"
                  checked={billingSame === true}
                  onChange={() => setBillingSame(true)}
                />

              </div>
            </section>

            {/* Mobile Order Summary */}
            <div className="lg:hidden mt-8 mb-6 pt-4 border-t border-gray-200">
              <button 
                type="button"
                onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {items.length > 1 && (
                      <div className="absolute top-1.5 left-1.5 w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm" />
                    )}
                    {firstItem && (
                      <div className="absolute top-0 left-0 w-full h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 z-10 shadow-sm">
                        <img src={firstItem.imageUrl} alt={firstItem.name} className="w-[85%] h-[85%] object-contain" />
                      </div>
                    )}
                    {items.length > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#2C0E11] text-white rounded-[7px] ring-2 ring-white flex items-center justify-center text-[10px] font-bold shadow-sm z-20">
                        {cartCount}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-[17px] text-gray-900 leading-tight">Total</span>
                    <span className="text-[13px] text-gray-500">{cartCount} items</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full uppercase">EGP</span>
                  <span className="font-semibold text-[17px]">{total.toFixed(2)}</span>
                  <svg 
                    className={`w-4 h-4 ml-0.5 text-gray-900 transition-transform duration-300 ${isMobileSummaryOpen ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileSummaryOpen ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="pt-2">
                  <CartSummaryContent />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {formError && (
                <div className="mb-4 text-red-500 text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {formError}
                </div>
              )}
              <div className="w-full flex flex-col items-center">
                <HoldButton
                  size="lg"
                  radius={6}
                  holdTime={1600}
                  backgroundColor="#202024"
                  fillColor="#2563eb"
                  textColor="#ffffff"
                  fillTextColor="#ffffff"
                  className="w-full hold-button--full !h-[54px] font-semibold tracking-wide shadow-xs"
                  icon={<CreditCard className="w-5 h-5 mr-1" strokeWidth={2} />}
                  doneIcon={<Check className="w-5 h-5 mr-1" strokeWidth={2.5} />}
                  doneLabel="Processing..."
                  disabled={isSubmitting || paymentMethod === 'card'}
                  onHold={() => {
                    if (formRef.current) {
                      setHasSubmitted(true);
                      if (!formRef.current.checkValidity()) {
                        formRef.current.reportValidity();
                        toast.error('Please complete all required fields.');
                        return;
                      }
                      formRef.current.requestSubmit();
                    }
                  }}
                  onTap={() => {
                    if (formRef.current && !formRef.current.checkValidity()) {
                      setHasSubmitted(true);
                      formRef.current.reportValidity();
                      toast.error('Please complete all required fields first.');
                    } else {
                      toast('Hold button to place order', {
                        icon: '💳',
                        style: {
                          background: 'rgba(26, 26, 26, 0.95)',
                          color: '#fff',
                          borderRadius: '100px',
                          fontSize: '13px',
                          padding: '10px 18px',
                        }
                      });
                    }
                  }}
                >
                  Hold to pay
                </HoldButton>
                <p className="text-[11px] text-gray-400 mt-2.5 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Press and hold to confirm and place your order
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200/60 pt-6 mt-10"></div>

          </form>
        </div>
      </div>

      {/* Right Side - Cart Summary */}
      <div className="hidden lg:flex w-full lg:w-[45%] xl:w-[45%] bg-[#f5f5f5] justify-start">
        <div className="w-full max-w-lg px-6 pt-28 pb-8 lg:pb-12 lg:pl-10 lg:pt-36 xl:pl-14 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto custom-scrollbar">
          
          <CartSummaryContent />

        </div>
      </div>

    </div>
  );
}
