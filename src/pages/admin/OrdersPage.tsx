import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable, TableAction } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { 
  getOrders, 
  updateOrderStatus, 
  updateOrderPaymentStatus, 
  deleteOrder 
} from '../../services/orders.service';
import type { Order, OrderStatus, PaymentStatus } from '../../types/order';
import { 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  Search, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  ShoppingBag,
  X,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Printer,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminListQueryOptions } from '../../lib/adminQuery';

const STORE_ADMIN_PHONE = "01011151366";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-200', icon: Clock },
  processing: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', icon: RefreshCw },
  shipped: { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700 border-purple-200', icon: Truck },
  delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-700' },
  paid: { label: 'Paid', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-800' },
};

function formatWhatsAppPhone(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (!cleaned) return '201011151366';
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '20' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('20') && cleaned.length === 10 && cleaned.startsWith('1')) {
    return '20' + cleaned;
  }
  return cleaned;
}

function buildWhatsAppMessage(order: Order, storePhone: string = STORE_ADMIN_PHONE): string {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsList = order.items
    .map((item, idx) => `  ${idx + 1}. *${item.name}* (x${item.quantity}) — ${item.subtotal.toFixed(2)} EGP`)
    .join('\n');

  return `👑 *CARDINAL ARTHUR | LUXURY LEATHER* 👑
──────────────────────────────
📦 *ORDER NOTIFICATION*

Dear *${order.customer.firstName} ${order.customer.lastName}*,
Thank you for shopping with *Cardinal Arthur*. Your order has been registered in our system.

📋 *Order #:* *${order.orderNumber}*
📅 *Date:* ${formattedDate}
⚡ *Status:* *${STATUS_CONFIG[order.status]?.label.toUpperCase() || order.status.toUpperCase()}*
💳 *Payment:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})

──────────────────────────────
👜 *ORDER ITEMS:*
${itemsList}

💰 *FINANCIAL SUMMARY:*
• Subtotal: ${order.pricing.subtotal.toFixed(2)} EGP
• Shipping: ${order.pricing.shippingFee === 0 ? 'FREE' : `${order.pricing.shippingFee.toFixed(2)} EGP`}
• *Total Order Value:* *${order.pricing.total.toFixed(2)} EGP*

──────────────────────────────
📍 *DELIVERY DESTINATION:*
• Address: ${order.shippingAddress.fullAddress}
• Region: ${order.shippingAddress.area ? `${order.shippingAddress.area}, ` : ''}${order.shippingAddress.governorate}
• Phone: ${order.customer.phone}${order.customer.additionalPhone ? ` / ${order.customer.additionalPhone}` : ''}
${order.notes ? `• Customer Notes: "${order.notes}"\n` : ''}
──────────────────────────────
📞 *Store Hotline:* *${storePhone}*
✨ _Cardinal Arthur — Handcrafted Egyptian Heritage_`;
}

/**
 * Dispatches WhatsApp message directly without wa.me Latin-1 redirect header corruption.
 * On desktop: loads web.whatsapp.com directly so query params are parsed in UTF-8.
 * On mobile: uses api.whatsapp.com to trigger native app.
 * Always copies to clipboard as instant guarantee.
 */
function openWhatsAppChat(phone: string, message: string, preferWeb: boolean = true) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Use direct web.whatsapp.com on desktop to avoid wa.me Latin-1 redirect header corrupting emojis
  const targetUrl = (!isMobile && preferWeb)
    ? `https://web.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`;

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState<Order | null>(null);
  const [whatsAppRecipientType, setWhatsAppRecipientType] = useState<'customer' | 'store' | 'custom'>('customer');
  const [customPhone, setCustomPhone] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Lock body scroll and close on Escape when any modal is open
  useEffect(() => {
    if (!selectedOrder && !orderToDelete && !whatsAppOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
        setOrderToDelete(null);
        setWhatsAppOrder(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrder, orderToDelete, whatsAppOrder]);

  // TanStack Query — this page only; no layout/global prefetch
  const { data: orders = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getOrders(100),
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 3,
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => 
      updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Order[]>(['admin-orders'], (prev) => 
        prev ? prev.map(o => o.id === variables.orderId ? { ...o, status: variables.status } : o) : []
      );
      if (selectedOrder && selectedOrder.id === variables.orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: variables.status } : null);
      }
      toast.success(`Order status updated to ${STATUS_CONFIG[variables.status].label}`);
    },
    onError: () => {
      toast.error('Failed to update status. Please try again.');
    }
  });

  // Payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: PaymentStatus }) => 
      updateOrderPaymentStatus(orderId, paymentStatus),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Order[]>(['admin-orders'], (prev) => 
        prev ? prev.map(o => o.id === variables.orderId ? { ...o, paymentStatus: variables.paymentStatus } : o) : []
      );
      if (selectedOrder && selectedOrder.id === variables.orderId) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: variables.paymentStatus } : null);
      }
      toast.success(`Payment status updated to ${variables.paymentStatus}`);
    },
    onError: () => {
      toast.error('Failed to update payment status.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.setQueryData<Order[]>(['admin-orders'], (prev) => 
        prev ? prev.filter(o => o.id !== orderId) : []
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
      toast.success('Order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete order.');
    }
  });

  const handleDelete = (order: Order) => {
    setOrderToDelete(order);
  };

  // Filtered orders list (done client-side for 0 cost and instant search)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.firstName.toLowerCase().includes(searchLower) ||
        order.customer.lastName.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(searchLower) ||
        order.shippingAddress.governorate.toLowerCase().includes(searchLower) ||
        order.shippingAddress.area.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  // Key KPI stats — revenue only counts paymentStatus === 'paid'
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const failedOrders = orders.filter(o => o.paymentStatus === 'failed').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    return { totalOrders, pendingOrders, completedOrders, paidOrders, failedOrders, totalRevenue };
  }, [orders]);

  const columns: Column<Order>[] = [
    {
      id: 'orderNumber',
      header: 'Order #',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#2C0E11] font-mono tracking-tight">{row.orderNumber}</span>
            {row.notes && (
              <span 
                title={`Customer Note: "${row.notes}"`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 cursor-help shrink-0 shadow-2xs"
              >
                <FileText className="w-2.5 h-2.5 text-rose-600" />
                Note
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-500">
            {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.customer.firstName} {row.customer.lastName}</span>
          <span className="text-xs text-gray-500 truncate max-w-[180px]">{row.customer.email}</span>
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Destination',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium text-gray-800">{row.shippingAddress.governorate}</span>
          <span className="text-gray-400">·</span>
          <span className="truncate max-w-[100px] text-gray-500">{row.shippingAddress.area}</span>
        </div>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {row.items.reduce((sum, i) => sum + i.quantity, 0)} pcs
          </span>
          {row.items[0]?.imageUrl && (
            <img 
              src={row.items[0].imageUrl} 
              alt="" 
              className="w-7 h-7 rounded object-cover border border-gray-200" 
            />
          )}
        </div>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#2C0E11]">
            {(row.pricing?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              {row.paymentMethod.toUpperCase()}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${PAYMENT_STATUS_CONFIG[row.paymentStatus]?.bg} ${PAYMENT_STATUS_CONFIG[row.paymentStatus]?.text}`}>
              {PAYMENT_STATUS_CONFIG[row.paymentStatus]?.label || row.paymentStatus}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* KPI Stats Section */}
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-3">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingBag}
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon={Clock}
        />
        <StatCard
          label="Delivered Orders"
          value={stats.completedOrders.toString()}
          icon={CheckCircle2}
        />
        <StatCard
          label="Paid Orders"
          value={stats.paidOrders.toString()}
          icon={BadgeCheck}
        />
        <StatCard
          label="Failed Orders"
          value={stats.failedOrders.toString()}
          icon={XCircle}
        />
        <StatCard
          label="Gross Revenue"
          value={`${stats.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} EGP`}
          icon={DollarSign}
        />
      </StatGrid>

      {/* Table Section */}
      <DataTable
        columns={columns}
        rows={filteredOrders}
        rowKey={(row) => row.id}
        empty={isLoading ? "Loading orders from database..." : "No orders found."}
        toolbar={
          <div className="flex flex-row items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search order #, customer, phone, area..."
                  className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
                />
              </div>
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh this page only"
                className="flex md:hidden h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 min-w-0 w-full md:w-auto">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 flex-1 md:flex-none">
                {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === st
                        ? 'bg-[#2C0E11] text-white shadow-sm'
                        : 'bg-[#F4F4F4] text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : STATUS_CONFIG[st]?.label || st}
                    <span className="ml-1.5 opacity-70">
                      ({st === 'all' ? orders.length : orders.filter(o => o.status === st).length})
                    </span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh this page only"
                className="hidden md:flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button 
              title="Send WhatsApp Order Message" 
              onClick={() => {
                setWhatsAppOrder(row);
                setWhatsAppRecipientType('customer');
              }}
              className="p-1.5 hover:bg-emerald-50 rounded-md text-emerald-600 transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
            <button 
              title="View full details" 
              onClick={() => setSelectedOrder(row)}
              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-700 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              title="Delete order" 
              onClick={() => handleDelete(row)}
              className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        renderExpandedRow={(row) => (
          <div className="flex flex-col gap-6">
            
            {/* Expanded Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-3">
              <div>
                <h4 className="font-bold text-[#2C0E11] text-base flex items-center gap-2">
                  <span>Order {row.orderNumber}</span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[row.status].bg} ${STATUS_CONFIG[row.status].text}`}>
                    {STATUS_CONFIG[row.status].label}
                  </span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {new Date(row.createdAt).toLocaleString()} · Payment via {row.paymentMethod.toUpperCase()} ({row.paymentStatus})
                </p>
              </div>

              {/* Quick Status & Payment Buttons */}
              <div className="flex flex-col sm:items-end gap-2.5">
                {/* 1. Quick Order Status */}
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mr-1">Update Status:</span>
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatusMutation.mutate({ orderId: row.id, status: st })}
                      disabled={row.status === st || updateStatusMutation.isPending}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        row.status === st
                          ? 'bg-[#2C0E11] text-white cursor-default shadow-xs'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                    >
                      {STATUS_CONFIG[st].label}
                    </button>
                  ))}
                </div>

                {/* 2. Quick Payment Status */}
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mr-1">Payment Status:</span>
                  {(['pending', 'paid', 'failed'] as PaymentStatus[]).map((pst) => (
                    <button
                      key={pst}
                      onClick={() => updatePaymentMutation.mutate({ orderId: row.id, paymentStatus: pst })}
                      disabled={row.paymentStatus === pst || updatePaymentMutation.isPending}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer capitalize ${
                        row.paymentStatus === pst
                          ? pst === 'paid'
                            ? 'bg-emerald-700 text-white cursor-default shadow-xs'
                            : pst === 'failed'
                            ? 'bg-rose-700 text-white cursor-default shadow-xs'
                            : 'bg-amber-600 text-white cursor-default shadow-xs'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                    >
                      {pst}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expanded Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Customer & Shipping Info */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/60 flex flex-col gap-3">
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2C0E11]" />
                  Shipping & Customer
                </h5>
                <div className="text-sm space-y-1 text-gray-700">
                  <p className="font-semibold text-gray-900">{row.customer.firstName} {row.customer.lastName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {row.customer.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {row.customer.phone}
                    {row.customer.additionalPhone && <span className="text-gray-400">/ {row.customer.additionalPhone}</span>}
                  </p>
                  <div className="pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-200 mt-2">
                    <p className="font-medium text-gray-900">{row.shippingAddress.fullAddress}</p>
                    <p>{row.shippingAddress.street ? `Street: ${row.shippingAddress.street}` : ''} {row.shippingAddress.building ? `· Bldg: ${row.shippingAddress.building}` : ''} {row.shippingAddress.apartment ? `· Apt: ${row.shippingAddress.apartment}` : ''}</p>
                    <p className="text-gray-500">{row.shippingAddress.area}, {row.shippingAddress.governorate} {row.shippingAddress.postalCode ? `(${row.shippingAddress.postalCode})` : ''}</p>
                  </div>
                  {/* Customer Note */}
                  {row.notes && (
                    <div className="pt-2 text-xs leading-relaxed border-t border-gray-200 mt-2">
                      <span className="font-bold text-rose-700 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-rose-600" />
                        Customer Note
                      </span>
                      <p className="font-medium text-gray-900 pl-2.5 border-l-2 border-rose-500 select-text break-words">
                        {row.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Order Items Breakdown */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/60 md:col-span-2 flex flex-col gap-3">
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#2C0E11]" />
                  Order Items ({row.items.length})
                </h5>
                
                <div className="divide-y divide-gray-200/80 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {row.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × {item.price.toFixed(2)} EGP</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {item.subtotal.toFixed(2)} EGP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="border-t border-gray-200 pt-3 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{row.pricing.subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee:</span>
                    <span>{row.pricing.shippingFee.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#2C0E11] pt-1 border-t border-gray-200/60">
                    <span>Total Order Value:</span>
                    <span>{row.pricing.total.toFixed(2)} EGP</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200/60">
              <div className="flex flex-wrap items-center gap-2">
                <TableAction 
                  label="View Full Invoice" 
                  tone="primary" 
                  onClick={() => setSelectedOrder(row)} 
                />
                <TableAction 
                  label="WhatsApp Receipt" 
                  tone="success" 
                  onClick={() => {
                    setWhatsAppOrder(row);
                    setWhatsAppRecipientType('customer');
                  }} 
                />
                <TableAction 
                  label="Print Order" 
                  onClick={() => {
                    setSelectedOrder(row);
                    setTimeout(() => window.print(), 300);
                  }} 
                />
                <TableAction 
                  label="Delete Order" 
                  tone="danger"
                  onClick={() => setOrderToDelete(row)} 
                />
              </div>
            </div>

          </div>
        )}
      />

      {/* Full Order Details Modal Rendered via Portal at document.body */}
      {selectedOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-[#FCFBF8] shrink-0">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold font-mono">Order Details</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] flex items-center gap-2 sm:gap-3">
                  <span>{selectedOrder.orderNumber}</span>
                  <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[selectedOrder.status].bg} ${STATUS_CONFIG[selectedOrder.status].text}`}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 custom-scrollbar">
              
              {/* Order Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#F4F4F4]">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-semibold">Date</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-semibold">Payment</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5 uppercase truncate">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-semibold">Total</span>
                  <p className="text-xs font-bold text-[#2C0E11] mt-0.5">
                    {selectedOrder.pricing.total.toFixed(2)} EGP
                  </p>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-semibold">Items</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} units
                  </p>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Customer</h4>
                  <p className="font-semibold text-gray-900 text-sm">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedOrder.customer.email}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Delivery Address</h4>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">{selectedOrder.shippingAddress.fullAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedOrder.shippingAddress.area ? `${selectedOrder.shippingAddress.area}, ` : ''}{selectedOrder.shippingAddress.governorate}
                  </p>
                </div>
                {selectedOrder.notes && (
                  <div className="sm:col-span-2 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      Customer Note
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-900 font-medium leading-relaxed pl-3 border-l-2 border-rose-500 select-text break-words">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 sm:mb-3">Purchased Items</h4>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 sm:gap-4 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.order-item-fallback') as HTMLElement;
                                if (fb) fb.classList.remove('hidden');
                              }}
                              className="w-full h-full object-cover" 
                            />
                          ) : null}
                          <div className={`order-item-fallback ${item.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-gray-400`}>
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] sm:text-xs text-gray-500">Qty: {item.quantity} × {item.price.toFixed(2)} EGP</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                        {item.subtotal.toFixed(2)} EGP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl space-y-2 text-sm border border-gray-200/60">
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Subtotal</span>
                  <span>{selectedOrder.pricing.subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Shipping Fee</span>
                  <span>{selectedOrder.pricing.shippingFee.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between font-bold text-sm sm:text-base text-[#2C0E11] pt-2 border-t border-gray-200">
                  <span>Final Total</span>
                  <span>{selectedOrder.pricing.total.toFixed(2)} EGP</span>
                </div>
              </div>

            </div>

            {/* Modal Footer with Actions - Fully Responsive & Mobile-Optimized */}
            <div className="p-3 sm:p-4 border-t border-gray-100 bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              
              {/* Selectors: Status & Payment */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3.5 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold sm:font-semibold text-gray-500 sm:text-gray-600 uppercase tracking-wider sm:normal-case">
                    Status:
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: e.target.value as OrderStatus })}
                    className="w-full sm:w-auto text-xs font-semibold px-2.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg border border-gray-300 bg-white text-gray-800 outline-none focus:border-[#2C0E11] focus:ring-1 focus:ring-[#2C0E11] cursor-pointer shadow-xs transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold sm:font-semibold text-gray-500 sm:text-gray-600 uppercase tracking-wider sm:normal-case">
                    Payment:
                  </span>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => updatePaymentMutation.mutate({ orderId: selectedOrder.id, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full sm:w-auto text-xs font-semibold px-2.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg border border-gray-300 bg-white text-gray-800 outline-none focus:border-[#2C0E11] focus:ring-1 focus:ring-[#2C0E11] cursor-pointer shadow-xs transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, Print, Close */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t border-gray-200/60 sm:border-t-0">
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppOrder(selectedOrder);
                    setWhatsAppRecipientType('customer');
                  }}
                  className="w-full sm:w-auto py-2.5 sm:py-2 px-2.5 sm:px-3.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-lg hover:bg-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto py-2.5 sm:py-2 px-2.5 sm:px-3.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl sm:rounded-lg hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="hidden sm:inline">Print Invoice</span>
                  <span className="sm:hidden">Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto py-2.5 sm:py-2 px-3 sm:px-5 text-xs font-bold text-white bg-[#2C0E11] rounded-xl sm:rounded-lg hover:bg-[#2C0E11]/90 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <span>Close</span>
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Elegant Delete Confirmation Modal Rendered via Portal */}
      {orderToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteMutation.isPending) setOrderToDelete(null);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-7 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button 
              onClick={() => setOrderToDelete(null)}
              disabled={deleteMutation.isPending}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Text details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight font-heading">
                Delete Order
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete order <span className="font-bold text-gray-900">{orderToDelete.orderNumber}</span>? This action cannot be undone and will remove all delivery and customer records.
              </p>
            </div>

            {/* Order Snippet Box */}
            <div className="w-full bg-[#F4F4F4] rounded-2xl p-3.5 text-xs text-gray-700 flex flex-col gap-1.5 border border-gray-200/60">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{orderToDelete.customer.firstName} {orderToDelete.customer.lastName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Destination:</span>
                <span className="font-semibold text-gray-800 truncate max-w-[200px] text-right">{orderToDelete.shippingAddress.governorate}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                <span className="text-gray-500 font-medium">Order Total:</span>
                <span className="font-bold text-[#2C0E11]">{orderToDelete.pricing.total.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full pt-1">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={deleteMutation.isPending}
                className="w-1/2 py-3 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(orderToDelete.id)}
                disabled={deleteMutation.isPending}
                className="w-1/2 py-3 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-[0.99] transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {deleteMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* WhatsApp Message Modal Rendered via Portal */}
      {whatsAppOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setWhatsAppOrder(null);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#FCFBF8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#25D366] flex items-center justify-center shadow-xs">
                  <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Send Order via WhatsApp</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Order <span className="font-mono font-bold text-gray-800">{whatsAppOrder.orderNumber}</span> · {whatsAppOrder.customer.firstName} {whatsAppOrder.customer.lastName}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setWhatsAppOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
              
              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Send Message To:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Option 1: Customer */}
                  <div 
                    onClick={() => setWhatsAppRecipientType('customer')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      whatsAppRecipientType === 'customer'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">Customer</span>
                      <span className="text-gray-600 font-mono mt-0.5 block truncate max-w-[120px]">{whatsAppOrder.customer.phone || 'No phone'}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      whatsAppRecipientType === 'customer' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {whatsAppRecipientType === 'customer' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>

                  {/* Option 2: My Number (Store Hotline) */}
                  <div 
                    onClick={() => setWhatsAppRecipientType('store')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      whatsAppRecipientType === 'store'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">My Number (Store)</span>
                      <span className="text-gray-600 font-mono mt-0.5 block">{STORE_ADMIN_PHONE}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      whatsAppRecipientType === 'store' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {whatsAppRecipientType === 'store' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>

                  {/* Option 3: Custom Number */}
                  <div 
                    onClick={() => setWhatsAppRecipientType('custom')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      whatsAppRecipientType === 'custom'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">Custom Number</span>
                      <span className="text-gray-500 text-[11px] mt-0.5 block">Courier / Warehouse</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      whatsAppRecipientType === 'custom' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {whatsAppRecipientType === 'custom' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>

                </div>

                {whatsAppRecipientType === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="tel"
                      placeholder="Enter mobile number (e.g. 01011151366)"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Message Content Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Message Preview
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = buildWhatsAppMessage(whatsAppOrder);
                      navigator.clipboard.writeText(msg);
                      setCopiedMessage(true);
                      setTimeout(() => setCopiedMessage(false), 2000);
                      toast.success('Message copied to clipboard');
                    }}
                    className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 max-h-56 overflow-y-auto text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed custom-scrollbar shadow-inner select-text">
                  {buildWhatsAppMessage(whatsAppOrder)}
                </div>
              </div>

              {/* Encoding Status Info Note */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct UTF-8 dispatch preserves all luxury icons without server encoding corruption. Full text is also copied to clipboard on open.</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWhatsAppOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetPhone = whatsAppRecipientType === 'store'
                      ? STORE_ADMIN_PHONE
                      : whatsAppRecipientType === 'custom'
                      ? (customPhone.trim() || STORE_ADMIN_PHONE)
                      : whatsAppOrder.customer.phone || STORE_ADMIN_PHONE;
                    const msg = buildWhatsAppMessage(whatsAppOrder);
                    openWhatsAppChat(targetPhone, msg, false);
                    toast.success('WhatsApp App link opened & copied!');
                    setWhatsAppOrder(null);
                  }}
                  className="py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Open via WhatsApp Mobile App or Desktop Client"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp App</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetPhone = whatsAppRecipientType === 'store'
                      ? STORE_ADMIN_PHONE
                      : whatsAppRecipientType === 'custom'
                      ? (customPhone.trim() || STORE_ADMIN_PHONE)
                      : whatsAppOrder.customer.phone || STORE_ADMIN_PHONE;
                    const msg = buildWhatsAppMessage(whatsAppOrder);
                    openWhatsAppChat(targetPhone, msg, true);
                    toast.success('WhatsApp Web opened & message copied to clipboard!');
                    setWhatsAppOrder(null);
                  }}
                  className="py-2.5 px-4.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                  title="Direct to WhatsApp Web without redirect corruption"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Open WhatsApp Web</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
