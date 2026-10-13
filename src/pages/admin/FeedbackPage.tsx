import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { 
  getFeedbacks, 
  deleteFeedback, 
  updateFeedbackStatus,
  markAllFeedbacksSeen,
  type FeedbackRecord,
  type FeedbackStatus
} from '../../services/feedback.service';
import { 
  Star, 
  MessageSquare, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Package, 
  FileText,
  Eye,
  EyeOff,
  CheckCheck,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminListQueryOptions } from '../../lib/adminQuery';

const RATING_TIERS: Record<number, { label: string; color: string }> = {
  5: { label: 'Exceptional', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  4: { label: 'Very Good', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  3: { label: 'Good', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  2: { label: 'Fair', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  1: { label: 'Needs Improvement', color: 'bg-red-50 text-red-700 border-red-200' },
};

/**
 * Ultra-smooth, interactive status pill ('new' | 'seen')
 * 1-click toggle with 0ms optimistic cache update and zero panel reload
 */
function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: FeedbackStatus;
  onChange: (newStatus: FeedbackStatus) => void;
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

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'seen'>('all');
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackRecord | null>(null);

  const { data: feedbacks = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: getFeedbacks,
    ...adminListQueryOptions,
  });

  // Optimistic status mutation: updates React Query cache instantly in 0ms with zero reloads
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) => 
      updateFeedbackStatus(id, status),
    onMutate: async ({ id, status }) => {
      // 1. Cancel pending refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['admin-feedbacks'] });

      // 2. Snapshot previous feedbacks for rollback if needed
      const previousFeedbacks = queryClient.getQueryData<FeedbackRecord[]>(['admin-feedbacks']);

      // 3. Optimistically update TanStack query cache immediately
      queryClient.setQueryData<FeedbackRecord[]>(['admin-feedbacks'], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, status } : item))
      );

      return { previousFeedbacks };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(['admin-feedbacks'], context.previousFeedbacks);
      }
      toast.error(err?.message || 'Failed to update feedback status');
    },
  });

  // Optimistic Mark All Seen mutation
  const markAllSeenMutation = useMutation({
    mutationFn: () => markAllFeedbacksSeen(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-feedbacks'] });
      const previousFeedbacks = queryClient.getQueryData<FeedbackRecord[]>(['admin-feedbacks']);

      queryClient.setQueryData<FeedbackRecord[]>(['admin-feedbacks'], (old = []) =>
        old.map((item) => ({ ...item, status: 'seen' as FeedbackStatus }))
      );

      return { previousFeedbacks };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(['admin-feedbacks'], context.previousFeedbacks);
      }
      toast.error(err?.message || 'Failed to update feedbacks');
    },
    onSuccess: () => {
      toast.success('All feedbacks marked as seen');
    },
  });

  // Optimistic Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin-feedbacks'] });
      const previousFeedbacks = queryClient.getQueryData<FeedbackRecord[]>(['admin-feedbacks']);

      queryClient.setQueryData<FeedbackRecord[]>(['admin-feedbacks'], (old = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previousFeedbacks };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(['admin-feedbacks'], context.previousFeedbacks);
      }
      toast.error(err?.message || 'Failed to delete feedback');
    },
    onSuccess: () => {
      setFeedbackToDelete(null);
      toast.success('Feedback deleted successfully');
    },
  });

  // KPI Calculations
  const totalCount = feedbacks.length;
  const newCount = feedbacks.filter((f) => f.status === 'new').length;
  const seenCount = feedbacks.filter((f) => f.status === 'seen').length;
  const avgRating = totalCount > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalCount).toFixed(1)
    : '0.0';
  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length;
  const fiveStarPercentage = totalCount > 0 ? Math.round((fiveStarCount / totalCount) * 100) : 0;

  // Filter feedbacks by query and status tab
  const filteredFeedbacks = useMemo(() => {
    let result = feedbacks;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) =>
        f.customerName.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.orderNumber.toLowerCase().includes(q) ||
        f.comment.toLowerCase().includes(q)
      );
    }

    return result;
  }, [feedbacks, searchQuery, statusFilter]);

  const columns: Column<FeedbackRecord>[] = [
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
      id: 'customer',
      header: 'Customer & Order',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2C0E11] text-sm">{row.customerName || 'Anonymous Customer'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
              {row.orderNumber}
            </span>
          </div>
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
            <span className="truncate max-w-[200px]" title={row.email}>{row.email || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 font-mono">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{row.phone || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'rating',
      header: 'Score & Rating',
      cell: (row) => {
        const tier = RATING_TIERS[row.rating] || RATING_TIERS[5];
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= row.rating
                      ? 'fill-[#C9A86A] text-[#C9A86A]'
                      : 'text-gray-200 fill-transparent'
                  }`}
                  strokeWidth={1.5}
                />
              ))}
              <span className="font-bold text-xs text-[#2C0E11] ml-1">{row.rating}.0</span>
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border w-fit ${tier.color}`}>
              {tier.label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'comment',
      header: 'Feedback Message',
      cell: (row) => (
        <div className="max-w-[280px]">
          {row.comment ? (
            <p className="text-xs text-gray-700 italic line-clamp-2 leading-relaxed" title={row.comment}>
              "{row.comment}"
            </p>
          ) : (
            <span className="text-xs text-gray-400 italic">No written note</span>
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
      
      {/* KPI Stats Section - Matching CategoriesPage StatGrid */}
      <StatGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={totalCount.toString()}
          icon={MessageSquare}
        />
        <StatCard
          label="New Messages"
          value={newCount.toString()}
          icon={Sparkles}
        />
        <StatCard
          label="Average Rating"
          value={`${avgRating} / 5.0`}
          icon={Star}
        />
        <StatCard
          label="5-Star Reviews"
          value={`${fiveStarCount} (${fiveStarPercentage}%)`}
          icon={FileText}
        />
      </StatGrid>

      {/* Table Section */}
      <DataTable
        columns={columns}
        rows={filteredFeedbacks}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading customer reviews...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No customer feedback found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all' 
                  ? `There are currently no reviews with status "${statusFilter}".` 
                  : 'Customer feedback submitted from checkout will appear here in real time.'}
              </span>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback by customer, phone, email, or order..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
              />
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Segmented Buttons */}
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

              {/* Mark all as seen button (if any are new) */}
              {newCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllSeenMutation.mutate()}
                  disabled={markAllSeenMutation.isPending}
                  className="flex h-10 sm:h-11 items-center gap-1.5 px-3.5 rounded-full bg-[#F4F4F4] text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Mark all new messages as seen"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#2C0E11]" />
                  <span className="hidden sm:inline">Mark All Seen</span>
                </button>
              )}

              {/* Refresh Button */}
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
            {/* Quick status toggle button */}
            <button
              type="button"
              title={row.status === 'new' ? 'Click to mark as Seen' : 'Click to mark as New'}
              onClick={(e) => {
                e.stopPropagation();
                statusMutation.mutate({
                  id: row.id,
                  status: row.status === 'new' ? 'seen' : 'new'
                });
              }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                row.status === 'new'
                  ? 'text-[#C9A86A] hover:bg-[#C9A86A]/10 hover:text-[#2C0E11]'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {row.status === 'new' ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {/* Delete button triggering shared ConfirmationModal */}
            <button 
              type="button"
              title="Delete Feedback" 
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackToDelete(row);
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
                  <span className="font-bold text-base text-[#2C0E11]">{row.customerName}</span>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full font-mono text-gray-600">
                    Order #{row.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Smooth Status Switcher in expanded row */}
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
                          ? "bg-gray-100 text-gray-900 shadow-xs" 
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
                {/* Customer Contact Details */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2C0E11]" />
                    Customer Information
                  </h5>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="font-semibold text-gray-900">{row.customerName}</span>
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

                {/* Rating & Review */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#C9A86A]" />
                    Score & Rating
                  </h5>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= row.rating
                              ? 'fill-[#C9A86A] text-[#C9A86A]'
                              : 'text-gray-200 fill-transparent'
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-[#2C0E11]">{row.rating} of 5</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${RATING_TIERS[row.rating]?.color || ''}`}>
                      {RATING_TIERS[row.rating]?.label || ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Message */}
              <div className="bg-white p-4 rounded-xl border border-gray-200/70 space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Customer Message
                </h5>
                {row.comment ? (
                  <p className="text-sm text-gray-800 leading-relaxed italic bg-stone-50/60 p-3 rounded-lg border border-stone-200/40">
                    "{row.comment}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No written comment provided by customer.</p>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* Shared Simple Confirmation Modal for Delete Action */}
      <ConfirmationModal
        isOpen={!!feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        onConfirm={() => {
          if (feedbackToDelete) {
            deleteMutation.mutate(feedbackToDelete.id);
          }
        }}
        title="Delete Customer Feedback"
        description={
          <span>
            Are you sure you want to delete the feedback from{' '}
            <strong className="text-[#2C0E11]">{feedbackToDelete?.customerName}</strong> (Order #{feedbackToDelete?.orderNumber})? This action cannot be undone.
          </span>
        }
        confirmText="Delete Feedback"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
