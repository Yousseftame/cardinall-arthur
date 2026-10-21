import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { 
  getContactMessages, 
  deleteContactMessage, 
  updateContactMessageStatus,
  markAllContactMessagesSeen,
  type ContactMessageRecord,
  type ContactMessageStatus
} from '../../services/contact.service';
import { 
  MessageSquare, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  FileText,
  Eye,
  CheckCheck,
  Check,
  Send,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminListQueryOptions } from '../../lib/adminQuery';

// Custom WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

function buildContactWhatsAppMessage(record: ContactMessageRecord): string {
  const cleanName = record.name?.trim() || 'there';
  const cleanMsg = record.message?.trim();

  return `Hello ${cleanName},

Thank you for reaching out. We received your message.${cleanMsg ? `\n"${cleanMsg}"` : ''}

How can we help you today?

Thank you,
*Cardinal Arthur*`;
}

/**
 * Dispatches WhatsApp message directly without wa.me Latin-1 redirect header corruption.
 * On desktop: loads web.whatsapp.com directly so query params are parsed in UTF-8.
 * On mobile: uses api.whatsapp.com to trigger native app.
 */
function openWhatsAppChat(phone: string, message: string, preferWeb: boolean = true) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const targetUrl = !isMobile && preferWeb
    ? `https://web.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`;

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

/**
 * 1-click status pill with 0ms optimistic updates
 */
function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: ContactMessageStatus;
  onChange: (newStatus: ContactMessageStatus) => void;
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
        "group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border",
        isNew
          ? "bg-[#2C0E11] text-white hover:bg-[#3E1418] border-[#2C0E11] shadow-xs hover:shadow-md"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200/80 shadow-2xs"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0 transition-all duration-300",
          isNew ? "bg-[#C9A86A] animate-pulse" : "bg-stone-400"
        )}
      />
      <span className="capitalize tracking-wide font-medium">
        {status}
      </span>
      <span
        className={cn(
          "text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-0.5",
          isNew ? "text-[#C9A86A]" : "text-stone-500"
        )}
      >
        ⇄
      </span>
    </button>
  );
}

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'seen'>('all');
  
  // Modals state
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRecord | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState<ContactMessageRecord | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessageRecord | null>(null);

  const { data: messages = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: getContactMessages,
    ...adminListQueryOptions,
  });

  // Keep selectedMessage in sync with latest query cache
  const activeSelectedMessage = useMemo(() => {
    if (!selectedMessage) return null;
    return messages.find((m) => m.id === selectedMessage.id) || selectedMessage;
  }, [messages, selectedMessage]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (whatsAppMessage) setWhatsAppMessage(null);
        else if (selectedMessage) setSelectedMessage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [whatsAppMessage, selectedMessage]);

  // Optimistic status mutation (0ms instant cache update)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) => 
      updateContactMessageStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-contact-messages'] });
      const previousMessages = queryClient.getQueryData<ContactMessageRecord[]>(['admin-contact-messages']);

      queryClient.setQueryData<ContactMessageRecord[]>(['admin-contact-messages'], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, status } : item))
      );

      return { previousMessages };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['admin-contact-messages'], context.previousMessages);
      }
      toast.error(err?.message || 'Failed to update message status');
    },
  });

  // Optimistic mark all seen
  const markAllSeenMutation = useMutation({
    mutationFn: () => markAllContactMessagesSeen(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-contact-messages'] });
      const previousMessages = queryClient.getQueryData<ContactMessageRecord[]>(['admin-contact-messages']);

      queryClient.setQueryData<ContactMessageRecord[]>(['admin-contact-messages'], (old = []) =>
        old.map((item) => ({ ...item, status: 'seen' as ContactMessageStatus }))
      );

      return { previousMessages };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['admin-contact-messages'], context.previousMessages);
      }
      toast.error(err?.message || 'Failed to update messages');
    },
    onSuccess: () => {
      toast.success('All messages marked as seen');
    },
  });

  // Optimistic delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin-contact-messages'] });
      const previousMessages = queryClient.getQueryData<ContactMessageRecord[]>(['admin-contact-messages']);

      queryClient.setQueryData<ContactMessageRecord[]>(['admin-contact-messages'], (old = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previousMessages };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['admin-contact-messages'], context.previousMessages);
      }
      toast.error(err?.message || 'Failed to delete message');
    },
    onSuccess: () => {
      setMessageToDelete(null);
      if (selectedMessage && messageToDelete && selectedMessage.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted successfully');
    },
  });

  // KPIs
  const totalCount = messages.length;
  const newCount = messages.filter((m) => m.status === 'new').length;
  const seenCount = messages.filter((m) => m.status === 'seen').length;

  // Filtered list
  const filteredMessages = useMemo(() => {
    let result = messages;

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }

    return result;
  }, [messages, searchQuery, statusFilter]);

  const handleOpenWhatsAppModal = (row: ContactMessageRecord) => {
    if (!row.phone?.trim()) {
      toast.error('This sender did not provide a phone number.');
      return;
    }
    setWhatsAppMessage(row);
  };

  const columns: Column<ContactMessageRecord>[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusTogglePill
          status={row.status}
          onChange={(newStatus) => {
            statusMutation.mutate({ id: row.id, status: newStatus });
          }}
        />
      ),
    },
    {
      id: 'sender',
      header: 'Sender Name',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#2C0E11] text-sm">{row.name || 'Anonymous Sender'}</span>
          <span className="text-[11px] text-gray-400 font-mono">Let's Talk Form</span>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact Information',
      cell: (row) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate max-w-[200px]" title={row.email}>
              {row.email || '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 font-mono">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{row.phone || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'message',
      header: 'Message Inquiry',
      cell: (row) => (
        <div className="max-w-[320px]">
          {row.message ? (
            <p className="text-xs text-gray-700 italic line-clamp-2 leading-relaxed" title={row.message}>
              "{row.message}"
            </p>
          ) : (
            <span className="text-xs text-gray-400 italic">No message text</span>
          )}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date Submitted',
      cell: (row) => {
        const dateObj = new Date(row.createdAt);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : row.createdAt;
        const formattedTime = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
      
      {/* KPI Stats Section - Matching CategoriesPage & FeedbackPage */}
      <StatGrid className="!grid-cols-1 sm:!grid-cols-3 xl:!grid-cols-3">
        <StatCard
          label="Total Messages"
          value={totalCount.toString()}
          icon={MessageSquare}
        />
        <StatCard
          label="New Inquiries"
          value={newCount.toString()}
          icon={Sparkles}
        />
        <StatCard
          label="Seen Messages"
          value={seenCount.toString()}
          icon={FileText}
        />
      </StatGrid>

      {/* Table Section */}
      <DataTable
        columns={columns}
        rows={filteredMessages}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading contact messages...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No contact messages found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all' 
                  ? `There are currently no inquiries with status "${statusFilter}".` 
                  : 'Inquiries submitted from the Let\'s Talk section will appear here in real time.'}
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
                  placeholder="Search messages by name, email, phone, or inquiry..."
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

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold overflow-x-auto scrollbar-hide min-w-0 flex-1 md:flex-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('new')}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    statusFilter === 'new'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${newCount > 0 ? 'bg-[#C9A86A] animate-pulse' : 'bg-gray-300'}`} />
                  New ({newCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('seen')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'seen'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Seen ({seenCount})
                </button>
              </div>

              {newCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllSeenMutation.mutate()}
                  disabled={markAllSeenMutation.isPending}
                  className="flex h-10 sm:h-11 items-center gap-1.5 px-3.5 rounded-full bg-[#F4F4F4] text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
                  title="Mark all new messages as seen"
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
            {/* WhatsApp Greeting Action - Opens WhatsApp Modal (Same like OrdersPage) */}
            <button
              type="button"
              title="Send Greeting via WhatsApp"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenWhatsAppModal(row);
              }}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>

            {/* View Full Data Modal Action (Same like OrdersPage) */}
            <button
              type="button"
              title="View Inquiry Details"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMessage(row);
              }}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Delete button triggering shared ConfirmationModal */}
            <button 
              type="button"
              title="Delete Message" 
              onClick={(e) => {
                e.stopPropagation();
                setMessageToDelete(row);
              }}
              className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        renderExpandedRow={(row) => {
          return (
            <div className="flex flex-col gap-4 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-200/60">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#2C0E11]">{row.name}</span>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full font-mono text-gray-600">
                    Inquiry #{row.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Toggle Switch */}
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-0.5 rounded-full text-xs font-semibold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (row.status !== 'new') {
                          statusMutation.mutate({ id: row.id, status: 'new' });
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer text-xs",
                        row.status === 'new' 
                          ? "bg-[#2C0E11] text-white shadow-xs" 
                          : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A86A] animate-pulse" />
                      New
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (row.status !== 'seen') {
                          statusMutation.mutate({ id: row.id, status: 'seen' });
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer text-xs",
                        row.status === 'seen' 
                          ? "bg-stone-100 text-stone-900 shadow-xs font-bold" 
                          : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Seen
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(row.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sender Contact Details */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Sender Information
                  </h5>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="font-semibold text-gray-900">{row.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Email Address:</span>
                      <span className="font-semibold text-gray-900">{row.email || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Phone Number:</span>
                      <span className="font-semibold font-mono text-gray-900">{row.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Direct Contact Actions
                  </h5>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppModal(row)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp Greeting</span>
                  </button>
                </div>
              </div>

              {/* Message Inquiry */}
              <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Full Customer Inquiry
                </h5>
                {row.message ? (
                  <p className="text-sm text-gray-800 leading-relaxed italic bg-stone-50/60 p-3.5 rounded-lg border border-stone-200/40 whitespace-pre-wrap">
                    "{row.message}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No message text provided.</p>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* ======================================================== */}
      {/* 1. DATA DETAILS MODAL (Fit for Purpose, same as OrdersPage) */}
      {/* ======================================================== */}
      {activeSelectedMessage && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMessage(null);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#FCFBF8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5 text-[#2C0E11]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Contact Inquiry Details</span>
                    <span className="font-mono text-xs font-normal bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                      #{activeSelectedMessage.id.slice(-6).toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    From <strong className="text-gray-800 font-semibold">{activeSelectedMessage.name}</strong> · Submitted {new Date(activeSelectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
              
              {/* Quick Status Bar */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status:</span>
                  <StatusTogglePill
                    status={activeSelectedMessage.status}
                    onChange={(newStatus) => {
                      statusMutation.mutate({ id: activeSelectedMessage.id, status: newStatus });
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {activeSelectedMessage.status === 'new' ? 'Awaiting Concierge Response' : 'Inquiry Reviewed'}
                </span>
              </div>

              {/* Sender Profile Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-gray-200/70 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Sender Name
                  </span>
                  <p className="text-sm font-bold text-gray-900">{activeSelectedMessage.name}</p>
                  <p className="text-xs text-gray-500">Contact form origin: Let's Talk Section</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-gray-200/70 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Phone Number
                  </span>
                  <p className="text-sm font-mono font-bold text-gray-900">
                    {activeSelectedMessage.phone || 'No phone provided'}
                  </p>
                  {activeSelectedMessage.phone && (
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppModal(activeSelectedMessage)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <WhatsAppIcon className="w-3 h-3" />
                      <span>Dispatch WhatsApp Greeting</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-gray-200/70 space-y-2 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Email Address
                  </span>
                  <p className="text-sm font-mono text-gray-900">{activeSelectedMessage.email || '—'}</p>
                </div>
              </div>

              {/* Customer Inquiry Message Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Customer Message
                  </label>
                  {activeSelectedMessage.message && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeSelectedMessage.message);
                        toast.success('Inquiry copied to clipboard');
                      }}
                      className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </button>
                  )}
                </div>

                <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl p-4.5 text-sm text-gray-800 leading-relaxed font-serif whitespace-pre-wrap shadow-inner select-text">
                  {activeSelectedMessage.message ? (
                    `"${activeSelectedMessage.message}"`
                  ) : (
                    <span className="italic text-gray-400">No message text provided.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setMessageToDelete(activeSelectedMessage);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppModal(activeSelectedMessage)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Send WhatsApp Hello</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* 2. WHATSAPP CONCIERGE MODAL (Matching OrdersPage Modal)  */}
      {/* ======================================================== */}
      {whatsAppMessage && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setWhatsAppMessage(null);
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
                    <span>Send Greeting via WhatsApp</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Contact Inquiry · <strong className="font-semibold text-gray-800">{whatsAppMessage.name}</strong>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setWhatsAppMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
              
              {/* Always send to the inquiry sender */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                    Sending To Sender
                  </span>
                  <span className="font-bold text-gray-900 block truncate">{whatsAppMessage.name}</span>
                  <span className="text-gray-600 font-mono text-xs mt-0.5 block truncate">
                    {whatsAppMessage.phone}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Message Content Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Concierge Greeting Preview
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = buildContactWhatsAppMessage(whatsAppMessage);
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
                  {buildContactWhatsAppMessage(whatsAppMessage)}
                </div>
              </div>

              {/* Encoding Status Info Note */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct UTF-8 dispatch preserves all luxury concierge formatting without server encoding corruption. Full text is also copied to clipboard on open.</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWhatsAppMessage(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetPhone = whatsAppMessage.phone?.trim();
                    if (!targetPhone) {
                      toast.error('This sender did not provide a phone number.');
                      return;
                    }
                    const msg = buildContactWhatsAppMessage(whatsAppMessage);
                    openWhatsAppChat(targetPhone, msg, false);
                    if (whatsAppMessage.status === 'new') {
                      statusMutation.mutate({ id: whatsAppMessage.id, status: 'seen' });
                    }
                    toast.success('WhatsApp App link opened & message copied!');
                    setWhatsAppMessage(null);
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
                    const targetPhone = whatsAppMessage.phone?.trim();
                    if (!targetPhone) {
                      toast.error('This sender did not provide a phone number.');
                      return;
                    }
                    const msg = buildContactWhatsAppMessage(whatsAppMessage);
                    openWhatsAppChat(targetPhone, msg, true);
                    if (whatsAppMessage.status === 'new') {
                      statusMutation.mutate({ id: whatsAppMessage.id, status: 'seen' });
                    }
                    toast.success('WhatsApp Web opened & message copied to clipboard!');
                    setWhatsAppMessage(null);
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

      {/* ======================================================== */}
      {/* 3. SHARED CONFIRMATION MODAL FOR DELETE ACTION           */}
      {/* ======================================================== */}
      <ConfirmationModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (messageToDelete) {
            deleteMutation.mutate(messageToDelete.id);
          }
        }}
        title="Delete Contact Inquiry"
        description={
          <span>
            Are you sure you want to delete the message from{' '}
            <strong className="text-[#2C0E11]">{messageToDelete?.name}</strong>? This action cannot be undone.
          </span>
        }
        confirmText="Delete Message"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

