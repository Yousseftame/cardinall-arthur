import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
  FileText,
  Mail,
  Banknote,
  DollarSign,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { DataTable, type Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  CLUB_PAYMENT_STATUSES,
  deleteClubAdvanceRequest,
  getClubAdvanceRequests,
  markAllClubAdvanceSeen,
  updateClubAdvancePaymentStatus,
  updateClubAdvanceStatus,
  type ClubAdvancePaymentStatus,
  type ClubAdvanceRecord,
  type ClubAdvanceStatus,
} from '../../services/clubAdvance.service';

const PAYMENT_STATUS_CONFIG: Record<
  ClubAdvancePaymentStatus,
  { label: string; bg: string; text: string; active: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    active: 'bg-amber-600 text-white',
  },
  received: {
    label: 'Received',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    active: 'bg-sky-700 text-white',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    active: 'bg-emerald-700 text-white',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    active: 'bg-rose-700 text-white',
  },
};

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function formatWhatsAppPhone(phone: string) {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = `20${cleaned.slice(1)}`;
  }
  return cleaned || '';
}

function openWhatsApp(phone: string, name: string) {
  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone) {
    toast.error('No valid phone number on this request');
    return;
  }
  const message = encodeURIComponent(
    `Hello ${name.trim() || 'there'},\n\nThank you for requesting an Advance Membership card for the Cardinal Arthur Club.\n\nWe are ready to confirm your request and arrange payment.\n\nThank you,\n*Cardinal Arthur*`
  );
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const url = !isMobile
    ? `https://web.whatsapp.com/send/?phone=${cleanPhone}&text=${message}`
    : `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: ClubAdvanceStatus;
  onChange: (status: ClubAdvanceStatus) => void;
  disabled?: boolean;
}) {
  const isNew = status === 'new';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(isNew ? 'seen' : 'new');
      }}
      title={isNew ? 'Click to mark as Seen' : 'Click to mark as New'}
      className={cn(
        'group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border',
        isNew
          ? 'bg-[#2C0E11] text-white hover:bg-[#3E1418] border-[#2C0E11] shadow-xs hover:shadow-md'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200/80 shadow-2xs'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0 transition-all duration-300',
          isNew ? 'bg-[#C9A86A] animate-pulse' : 'bg-stone-400'
        )}
      />
      <span className="capitalize tracking-wide font-medium">{status}</span>
      <span
        className={cn(
          'text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-0.5',
          isNew ? 'text-[#C9A86A]' : 'text-stone-500'
        )}
      >
        ⇄
      </span>
    </button>
  );
}

function PaymentStatusSelect({
  paymentStatus,
  onChange,
  disabled = false,
}: {
  paymentStatus: ClubAdvancePaymentStatus;
  onChange: (status: ClubAdvancePaymentStatus) => void;
  disabled?: boolean;
}) {
  const config = PAYMENT_STATUS_CONFIG[paymentStatus];
  return (
    <div className="relative inline-flex items-center">
      <select
        value={paymentStatus}
        disabled={disabled}
        title="Change payment status"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value as ClubAdvancePaymentStatus);
        }}
        className={cn(
          'appearance-none cursor-pointer rounded-md border-0 outline-none',
          'h-7 pl-2.5 pr-7 text-[11px] font-bold uppercase tracking-wide leading-none',
          'focus:ring-2 focus:ring-[#2C0E11]/20 transition-colors',
          config.bg,
          config.text,
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {CLUB_PAYMENT_STATUSES.map((pst) => (
          <option key={pst} value={pst}>
            {PAYMENT_STATUS_CONFIG[pst].label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-current opacity-60"
        aria-hidden
      />
    </div>
  );
}

function PaymentStatusControls({
  paymentStatus,
  onChange,
  disabled = false,
}: {
  paymentStatus: ClubAdvancePaymentStatus;
  onChange: (status: ClubAdvancePaymentStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {CLUB_PAYMENT_STATUSES.map((pst) => {
        const config = PAYMENT_STATUS_CONFIG[pst];
        const isActive = paymentStatus === pst;
        return (
          <button
            key={pst}
            type="button"
            disabled={disabled || isActive}
            onClick={(e) => {
              e.stopPropagation();
              onChange(pst);
            }}
            className={cn(
              'px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer',
              isActive
                ? `${config.active} cursor-default shadow-xs`
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
            )}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ClubAdvanceRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'seen'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | ClubAdvancePaymentStatus>('all');
  const [selectedRequest, setSelectedRequest] = useState<ClubAdvanceRecord | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<ClubAdvanceRecord | null>(null);

  const { data: requests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-club-advance'],
    queryFn: getClubAdvanceRequests,
    ...adminListQueryOptions,
  });

  const activeSelected = useMemo(() => {
    if (!selectedRequest) return null;
    return requests.find((r) => r.id === selectedRequest.id) || selectedRequest;
  }, [requests, selectedRequest]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRequest) setSelectedRequest(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedRequest]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClubAdvanceStatus }) =>
      updateClubAdvanceStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-club-advance'] });
      const previous = queryClient.getQueryData<ClubAdvanceRecord[]>([
        'admin-club-advance',
      ]);
      queryClient.setQueryData<ClubAdvanceRecord[]>(
        ['admin-club-advance'],
        (old = []) => old.map((item) => (item.id === id ? { ...item, status } : item))
      );
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-club-advance'], context.previous);
      }
      toast.error(err?.message || 'Failed to update status');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: ClubAdvancePaymentStatus;
    }) => updateClubAdvancePaymentStatus(id, paymentStatus),
    onMutate: async ({ id, paymentStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-club-advance'] });
      const previous = queryClient.getQueryData<ClubAdvanceRecord[]>([
        'admin-club-advance',
      ]);
      queryClient.setQueryData<ClubAdvanceRecord[]>(
        ['admin-club-advance'],
        (old = []) =>
          old.map((item) => (item.id === id ? { ...item, paymentStatus } : item))
      );
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-club-advance'], context.previous);
      }
      toast.error(err?.message || 'Failed to update payment status');
    },
    onSuccess: (_data, vars) => {
      toast.success(
        `Payment marked as ${PAYMENT_STATUS_CONFIG[vars.paymentStatus].label}`
      );
    },
  });

  const markAllSeenMutation = useMutation({
    mutationFn: () => markAllClubAdvanceSeen(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-club-advance'] });
      const previous = queryClient.getQueryData<ClubAdvanceRecord[]>([
        'admin-club-advance',
      ]);
      queryClient.setQueryData<ClubAdvanceRecord[]>(
        ['admin-club-advance'],
        (old = []) => old.map((item) => ({ ...item, status: 'seen' as const }))
      );
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-club-advance'], context.previous);
      }
      toast.error(err?.message || 'Failed to update requests');
    },
    onSuccess: () => toast.success('All requests marked as seen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClubAdvanceRequest(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin-club-advance'] });
      const previous = queryClient.getQueryData<ClubAdvanceRecord[]>([
        'admin-club-advance',
      ]);
      queryClient.setQueryData<ClubAdvanceRecord[]>(
        ['admin-club-advance'],
        (old = []) => old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-club-advance'], context.previous);
      }
      toast.error(err?.message || 'Failed to delete request');
    },
    onSuccess: () => {
      setRequestToDelete(null);
      if (
        selectedRequest &&
        requestToDelete &&
        selectedRequest.id === requestToDelete.id
      ) {
        setSelectedRequest(null);
      }
      toast.success('Request deleted successfully');
    },
  });

  const totalCount = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const seenCount = requests.filter((r) => r.status === 'seen').length;
  const pendingPayCount = requests.filter((r) => r.paymentStatus === 'pending').length;
  const receivedCount = requests.filter((r) => r.paymentStatus === 'received').length;
  const paidCount = requests.filter((r) => r.paymentStatus === 'paid').length;
  const cancelledCount = requests.filter((r) => r.paymentStatus === 'cancelled').length;
  // Same rule as Orders Gross Revenue: only paymentStatus === 'paid' counts
  const grossRevenue = requests
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.priceEgp || 0), 0);

  const filteredRequests = useMemo(() => {
    let result = requests;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (paymentFilter !== 'all') {
      result = result.filter((r) => r.paymentStatus === paymentFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.paymentStatus.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requests, searchQuery, statusFilter, paymentFilter]);

  const columns: Column<ClubAdvanceRecord>[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusTogglePill
          status={row.status}
          onChange={(status) => statusMutation.mutate({ id: row.id, status })}
        />
      ),
    },
    {
      id: 'member',
      header: 'Applicant',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#2C0E11] text-sm">
            {row.name || 'Guest'}
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            Advance · {row.priceEgp.toLocaleString('en-US')} EGP
          </span>
        </div>
      ),
    },
    {
      id: 'payment',
      header: 'Payment',
      cell: (row) => (
        <PaymentStatusSelect
          paymentStatus={row.paymentStatus}
          disabled={paymentMutation.isPending}
          onChange={(paymentStatus) =>
            paymentMutation.mutate({ id: row.id, paymentStatus })
          }
        />
      ),
    },
    {
      id: 'phone',
      header: 'WhatsApp',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[160px]" title={row.phone}>
            {row.phone || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'address',
      header: 'Address',
      cell: (row) => (
        <div className="max-w-[220px]">
          {row.address ? (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C9A86A] shrink-0 mt-0.5" />
              <p
                className="text-xs text-gray-700 line-clamp-2 leading-relaxed"
                title={row.address}
              >
                {row.address}
              </p>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No address</span>
          )}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Submitted',
      cell: (row) => {
        const dateObj = new Date(row.createdAt);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : row.createdAt;
        const formattedTime = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return (
          <div className="flex flex-col text-xs text-gray-500">
            <span className="font-medium text-gray-700">{formattedDate}</span>
            <span className="text-[11px] text-gray-400">{formattedTime}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-3">
        <StatCard label="Total Requests" value={totalCount.toString()} icon={CreditCard} />
        <StatCard label="Pending Payment" value={pendingPayCount.toString()} icon={Sparkles} />
        <StatCard label="Received" value={receivedCount.toString()} icon={Banknote} />
        <StatCard label="Paid" value={paidCount.toString()} icon={Banknote} />
        <StatCard label="Cancelled" value={cancelledCount.toString()} icon={XCircle} />
        <StatCard
          label="Gross Revenue"
          value={`${grossRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} EGP`}
          icon={DollarSign}
        />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={filteredRequests}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading club requests...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No club requests found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'No requests match the current filters.'
                  : 'Advance membership requests from the Club page will appear here.'}
              </span>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-row items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
            <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, email, or address..."
                  className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
                />
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex md:hidden h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh this page only"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto flex-wrap">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold overflow-x-auto scrollbar-hide min-w-0">
                {([
                  ['all', `All (${totalCount})`],
                  ['new', `New (${newCount})`],
                  ['seen', `Seen (${seenCount})`],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                      statusFilter === key
                        ? 'bg-white text-[#2C0E11] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {key === 'new' && (
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          newCount > 0 ? 'bg-[#C9A86A] animate-pulse' : 'bg-gray-300'
                        )}
                      />
                    )}
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold overflow-x-auto scrollbar-hide min-w-0">
                {(
                  [
                    ['all', 'Pay: All'],
                    ['pending', 'Pending'],
                    ['received', 'Received'],
                    ['paid', 'Paid'],
                    ['cancelled', 'Cancelled'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentFilter(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap',
                      paymentFilter === key
                        ? 'bg-white text-[#2C0E11] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {newCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllSeenMutation.mutate()}
                  disabled={markAllSeenMutation.isPending}
                  className="flex h-10 sm:h-11 items-center gap-1.5 px-3.5 rounded-full bg-[#F4F4F4] text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
                  title="Mark all new requests as seen"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#2C0E11]" />
                  <span className="hidden sm:inline">Mark All Seen</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="hidden md:flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh this page only"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View Request Details"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequest(row);
                if (row.status === 'new') {
                  statusMutation.mutate({ id: row.id, status: 'seen' });
                }
              }}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="WhatsApp Applicant"
              onClick={(e) => {
                e.stopPropagation();
                openWhatsApp(row.phone, row.name);
              }}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Delete Request"
              onClick={(e) => {
                e.stopPropagation();
                setRequestToDelete(row);
              }}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {activeSelected &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[#2C0E11]/40 backdrop-blur-sm"
              onClick={() => setSelectedRequest(null)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-lg font-bold text-[#2C0E11]">
                    Club Request Details
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    #{activeSelected.id.slice(-8).toUpperCase()} · Advance Membership
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <StatusTogglePill
                    status={activeSelected.status}
                    onChange={(status) =>
                      statusMutation.mutate({ id: activeSelected.id, status })
                    }
                  />
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(activeSelected.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#2C0E11]/[0.04] border border-[#2C0E11]/10 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2C0E11]">
                    <CreditCard className="w-4 h-4 text-[#C9A86A]" />
                    Advance Card
                  </div>
                  <span className="text-sm font-bold text-[#2C0E11]">
                    {activeSelected.priceEgp.toLocaleString('en-US')} EGP
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-[#C9A86A]" />
                    Payment Status
                  </h4>
                  <PaymentStatusControls
                    paymentStatus={activeSelected.paymentStatus}
                    disabled={paymentMutation.isPending}
                    onChange={(paymentStatus) =>
                      paymentMutation.mutate({
                        id: activeSelected.id,
                        paymentStatus,
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[#2C0E11] text-white flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                        Applicant
                      </p>
                      <p className="font-bold text-[#2C0E11] truncate">
                        {activeSelected.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                        WhatsApp
                      </p>
                      <p className="font-semibold text-gray-800 truncate">
                        {activeSelected.phone}
                      </p>
                    </div>
                  </div>

                  {activeSelected.email ? (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A86A]/15 text-[#2C0E11] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                          Email
                        </p>
                        <p className="font-semibold text-gray-800 truncate">
                          {activeSelected.email}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A86A]" />
                    Full Address
                  </h4>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeSelected.address || '—'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Notes
                  </h4>
                  {activeSelected.notes ? (
                    <p className="text-sm text-gray-700 leading-relaxed italic bg-stone-50/80 p-4 rounded-xl border border-stone-100">
                      "{activeSelected.notes}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No notes provided</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(activeSelected.phone, activeSelected.name)
                  }
                  className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="h-11 px-5 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestToDelete(activeSelected)}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white border border-red-200 text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ConfirmationModal
        isOpen={!!requestToDelete}
        onClose={() => setRequestToDelete(null)}
        onConfirm={() => {
          if (requestToDelete) deleteMutation.mutate(requestToDelete.id);
        }}
        title="Delete Club Request"
        description={
          <span>
            Are you sure you want to delete the Advance Membership request from{' '}
            <strong className="text-[#2C0E11]">{requestToDelete?.name}</strong>? This
            action cannot be undone.
          </span>
        }
        confirmText="Delete Request"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
