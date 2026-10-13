import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { 
  getCantFindRequests, 
  deleteCantFindRequest, 
  updateCantFindStatus,
  markAllCantFindSeen,
  type CantFindRecord,
  type CantFindStatus
} from '../../services/cantFind.service';
import { 
  Sparkles, 
  Search, 
  RefreshCw, 
  Trash2, 
  Mail, 
  Calendar, 
  User, 
  FileText,
  Eye,
  CheckCheck,
  Check,
  X,
  FlaskConical,
  Palette,
  MessageSquareQuote
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminListQueryOptions } from '../../lib/adminQuery';

/**
 * 1-click status pill with optimistic updates
 */
function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: CantFindStatus;
  onChange: (newStatus: CantFindStatus) => void;
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

export default function CantFindRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'seen'>('all');
  const [selectedRequest, setSelectedRequest] = useState<CantFindRecord | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<CantFindRecord | null>(null);

  const { data: requests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-cant-find'],
    queryFn: getCantFindRequests,
    ...adminListQueryOptions,
  });

  const activeSelectedRequest = useMemo(() => {
    if (!selectedRequest) return null;
    return requests.find((r) => r.id === selectedRequest.id) || selectedRequest;
  }, [requests, selectedRequest]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRequest) {
        setSelectedRequest(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRequest]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CantFindStatus }) => 
      updateCantFindStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-cant-find'] });
      const previousRequests = queryClient.getQueryData<CantFindRecord[]>(['admin-cant-find']);

      queryClient.setQueryData<CantFindRecord[]>(['admin-cant-find'], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, status } : item))
      );

      return { previousRequests };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-cant-find'], context.previousRequests);
      }
      toast.error(err?.message || 'Failed to update request status');
    },
  });

  const markAllSeenMutation = useMutation({
    mutationFn: () => markAllCantFindSeen(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-cant-find'] });
      const previousRequests = queryClient.getQueryData<CantFindRecord[]>(['admin-cant-find']);

      queryClient.setQueryData<CantFindRecord[]>(['admin-cant-find'], (old = []) =>
        old.map((item) => ({ ...item, status: 'seen' as CantFindStatus }))
      );

      return { previousRequests };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-cant-find'], context.previousRequests);
      }
      toast.error(err?.message || 'Failed to update requests');
    },
    onSuccess: () => {
      toast.success('All requests marked as seen');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCantFindRequest(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin-cant-find'] });
      const previousRequests = queryClient.getQueryData<CantFindRecord[]>(['admin-cant-find']);

      queryClient.setQueryData<CantFindRecord[]>(['admin-cant-find'], (old = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previousRequests };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-cant-find'], context.previousRequests);
      }
      toast.error(err?.message || 'Failed to delete request');
    },
    onSuccess: () => {
      setRequestToDelete(null);
      if (selectedRequest && requestToDelete && selectedRequest.id === requestToDelete.id) {
        setSelectedRequest(null);
      }
      toast.success('Request deleted successfully');
    },
  });

  const totalCount = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const seenCount = requests.filter((r) => r.status === 'seen').length;
  const withInspirationCount = requests.filter((r) => r.designerInspiration?.trim()).length;

  const filteredRequests = useMemo(() => {
    let result = requests;

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.desiredNotes.toLowerCase().includes(q) ||
        r.designerInspiration.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q)
      );
    }

    return result;
  }, [requests, searchQuery, statusFilter]);

  const columns: Column<CantFindRecord>[] = [
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
      id: 'requester',
      header: 'Requester',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#2C0E11] text-sm">{row.name || 'Guest'}</span>
          <span className="text-[11px] text-gray-400 font-mono">Community Request</span>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[200px]" title={row.email}>
            {row.email || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'notes',
      header: 'Desired Notes',
      cell: (row) => (
        <div className="max-w-[220px]">
          {row.desiredNotes ? (
            <div className="flex items-start gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-[#C9A86A] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-medium" title={row.desiredNotes}>
                {row.desiredNotes}
              </p>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No notes specified</span>
          )}
        </div>
      ),
    },
    {
      id: 'inspiration',
      header: 'Inspiration',
      cell: (row) => (
        <div className="max-w-[180px]">
          {row.designerInspiration ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#2C0E11]/5 text-[#2C0E11] border border-[#2C0E11]/10">
              <Palette className="w-3 h-3 text-[#C9A86A]" />
              <span className="truncate max-w-[140px]" title={row.designerInspiration}>
                {row.designerInspiration}
              </span>
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">None</span>
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
      
      <StatGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={totalCount.toString()}
          icon={FlaskConical}
        />
        <StatCard
          label="New Requests"
          value={newCount.toString()}
          icon={Sparkles}
        />
        <StatCard
          label="Seen Requests"
          value={seenCount.toString()}
          icon={FileText}
        />
        <StatCard
          label="With Inspiration"
          value={withInspirationCount.toString()}
          icon={Palette}
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
              <span>Loading scent requests...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No scent requests found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all' 
                  ? `There are currently no requests with status "${statusFilter}".` 
                  : 'Community requests from the Can\'t Find It page will appear here.'}
              </span>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, notes, or inspiration..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
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
                  className="flex h-10 sm:h-11 items-center gap-1.5 px-3.5 rounded-full bg-[#F4F4F4] text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
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
                className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
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
              disabled
              title="Send Email (disabled)"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-gray-300 cursor-not-allowed opacity-50"
            >
              <Mail className="w-4 h-4" />
            </button>

            <button 
              type="button"
              title="Delete Request" 
              onClick={(e) => {
                e.stopPropagation();
                setRequestToDelete(row);
              }}
              className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        renderExpandedRow={(row) => (
          <div className="flex flex-col gap-4 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-200/60">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#2C0E11]">{row.name}</span>
                <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full font-mono text-gray-600">
                  Request #{row.id.slice(-6).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3">
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
              <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2C0E11]" />
                  Requester Information
                </h5>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Full Name:</span>
                    <span className="font-semibold text-gray-900">{row.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Email Address:</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                      {row.email || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-[#C9A86A]" />
                  Scent Profile
                </h5>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Desired Notes:</span>
                    <span className="font-semibold text-gray-900 text-right">{row.desiredNotes || '—'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Inspiration:</span>
                    <span className="font-semibold text-gray-900 text-right">{row.designerInspiration || 'None provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-1.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#2C0E11]" />
                Request Story & Details
              </h5>
              {row.details ? (
                <p className="text-sm text-gray-800 leading-relaxed italic bg-stone-50/60 p-3 rounded-lg border border-stone-200/40">
                  "{row.details}"
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">No additional details provided.</p>
              )}
            </div>
          </div>
        )}
      />

      {/* Detail Modal */}
      {activeSelectedRequest && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#2C0E11]/40 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg font-bold text-[#2C0E11]">Scent Request Details</h3>
                <span className="text-xs text-gray-400 font-mono">
                  #{activeSelectedRequest.id.slice(-8).toUpperCase()}
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
                  status={activeSelectedRequest.status}
                  onChange={(newStatus) => {
                    statusMutation.mutate({ id: activeSelectedRequest.id, status: newStatus });
                  }}
                />
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeSelectedRequest.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-[#2C0E11] text-white flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Requester</p>
                    <p className="font-bold text-[#2C0E11] truncate">{activeSelectedRequest.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A86A]/15 text-[#2C0E11] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Email</p>
                    <p className="font-semibold text-gray-800 truncate">
                      {activeSelectedRequest.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-[#C9A86A]" />
                  Desired Notes
                </h4>
                <p className="text-sm text-gray-800 font-medium leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                  {activeSelectedRequest.desiredNotes || '—'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#C9A86A]" />
                  Designer Inspiration
                </h4>
                {activeSelectedRequest.designerInspiration ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2C0E11]/5 text-[#2C0E11] border border-[#2C0E11]/10">
                    {activeSelectedRequest.designerInspiration}
                  </span>
                ) : (
                  <p className="text-xs text-gray-400 italic">No designer inspiration provided</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-[#2C0E11]" />
                  Story & Additional Details
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed italic bg-stone-50/80 p-4 rounded-xl border border-stone-100">
                  "{activeSelectedRequest.details || 'No details provided.'}"
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="h-11 px-5 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestToDelete(activeSelectedRequest);
                }}
                className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={!!requestToDelete}
        onClose={() => setRequestToDelete(null)}
        onConfirm={() => {
          if (requestToDelete) {
            deleteMutation.mutate(requestToDelete.id);
          }
        }}
        title="Delete Scent Request"
        description={
          <span>
            Are you sure you want to delete the request from{' '}
            <strong className="text-[#2C0E11]">{requestToDelete?.name}</strong>
            {requestToDelete?.desiredNotes ? (
              <> for notes &ldquo;{requestToDelete.desiredNotes}&rdquo;</>
            ) : null}
            ? This action cannot be undone.
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
