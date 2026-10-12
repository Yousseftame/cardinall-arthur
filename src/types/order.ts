export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtotal: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalPhone?: string;
}

export interface OrderShippingAddress {
  governorate: string;
  area: string;
  street: string;
  building: string;
  apartment: string;
  fullAddress: string;
  postalCode?: string;
}

export interface OrderPricing {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  emailOffers?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

export interface GovernorateRate {
  id: string;
  name: string;
  shippingFee: number;
  active: boolean;
}

export interface CheckoutSettings {
  standardShippingFee: number;
  freeShippingThreshold: number;
  enableCod: boolean;
  enableCard: boolean;
  deliveryTimeEstimate: string;
  governorates: GovernorateRate[];
  contactEmail: string;
  contactPhone: string;
  orderNotesEnabled: boolean;
  updatedAt?: string;
}
