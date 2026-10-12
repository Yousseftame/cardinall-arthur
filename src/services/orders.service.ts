import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import type { Order, CreateOrderInput, OrderStatus, PaymentStatus } from "../types/order";

const ORDERS_COLLECTION = "orders";

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CA-${timestamp}${random}`;
};

/**
 * Creates a new order in Firestore
 * Performs exactly 1 cheap write operation
 */
export const createOrder = async (orderInput: CreateOrderInput): Promise<{ id: string; orderNumber: string }> => {
  try {
    const nowIso = new Date().toISOString();
    
    // Ensure all optional undefined fields are cleaned so Firestore doesn't error
    const sanitizedData = {
      orderNumber: orderInput.orderNumber || generateOrderNumber(),
      customer: {
        firstName: orderInput.customer.firstName || '',
        lastName: orderInput.customer.lastName || '',
        email: orderInput.customer.email || '',
        phone: orderInput.customer.phone || '',
        ...(orderInput.customer.additionalPhone ? { additionalPhone: orderInput.customer.additionalPhone } : {}),
      },
      shippingAddress: {
        governorate: orderInput.shippingAddress.governorate || '',
        area: orderInput.shippingAddress.area || '',
        street: orderInput.shippingAddress.street || '',
        building: orderInput.shippingAddress.building || '',
        apartment: orderInput.shippingAddress.apartment || '',
        fullAddress: orderInput.shippingAddress.fullAddress || '',
        ...(orderInput.shippingAddress.postalCode ? { postalCode: orderInput.shippingAddress.postalCode } : {}),
      },
      items: orderInput.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        imageUrl: item.imageUrl || '',
        subtotal: Number(item.subtotal),
      })),
      pricing: {
        subtotal: Number(orderInput.pricing.subtotal),
        shippingFee: Number(orderInput.pricing.shippingFee),
        discount: Number(orderInput.pricing.discount || 0),
        total: Number(orderInput.pricing.total),
        currency: orderInput.pricing.currency || 'EGP',
      },
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentStatus || 'pending',
      status: orderInput.status || 'pending',
      ...(orderInput.notes ? { notes: orderInput.notes } : {}),
      emailOffers: Boolean(orderInput.emailOffers),
      createdAt: nowIso,
      updatedAt: nowIso,
      _serverTimestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), sanitizedData);
    return {
      id: docRef.id,
      orderNumber: sanitizedData.orderNumber,
    };
  } catch (error) {
    console.error("Failed to create order in Firebase Firestore:", error);
    throw error;
  }
};

/**
 * Fetches all orders from Firestore (ordered by creation date desc)
 * Cached with TanStack Query to keep reads minimal & cheap
 */
export const getOrders = async (maxOrders = 100): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxOrders)
    );

    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        orderNumber: data.orderNumber || `#${docSnap.id.slice(0, 6).toUpperCase()}`,
        customer: data.customer || {
          firstName: 'Guest',
          lastName: 'Customer',
          email: '',
          phone: '',
        },
        shippingAddress: data.shippingAddress || {
          governorate: '',
          area: '',
          street: '',
          building: '',
          apartment: '',
          fullAddress: '',
        },
        items: data.items || [],
        pricing: data.pricing || {
          subtotal: 0,
          shippingFee: 0,
          discount: 0,
          total: 0,
          currency: 'EGP',
        },
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus: data.paymentStatus || 'pending',
        status: data.status || 'pending',
        notes: data.notes,
        emailOffers: data.emailOffers,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as Order;
    });
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error);
    // If indexing is pending or query fails, attempt basic collection get without orderBy
    try {
      const fallbackSnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
      return fallbackSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Order[];
    } catch (fallbackError) {
      console.error("Fallback orders fetch failed:", fallbackError);
      throw error;
    }
  }
};

/**
 * Fetches a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Updates order status (e.g. pending -> processing -> shipped -> delivered -> cancelled)
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      _serverTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

/**
 * Updates payment status (pending -> paid -> failed)
 */
export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating order ${orderId} payment status:`, error);
    throw error;
  }
};

/**
 * Deletes an order from Firestore
 */
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};
