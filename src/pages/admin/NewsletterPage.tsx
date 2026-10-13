import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { 
  getNewsletterSubscribers, 
  type NewsletterRecord,
} from '../../services/newsletter.service';
import { exportToExcel, formatExportDateTime } from '../../lib/exportExcel';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: subscribers = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: getNewsletterSubscribers,
    ...adminListQueryOptions,
  });

  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;

    const q = searchQuery.toLowerCase();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, searchQuery]);

  const handleExport = () => {
    if (!subscribers.length) {
      toast.error('No subscribers to export.');
      return;
    }

    setIsExporting(true);
    try {
      const rows = subscribers.map((s, index) => ({
        '#': index + 1,
        Email: s.email || '',
        'Date & Time': formatExportDateTime(s.createdAt),
      }));

      exportToExcel(rows, 'newsletter-subscribers', 'Newsletter');
      toast.success(`Exported ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'} to Excel.`);
    } catch (err: any) {
      console.error('Newsletter export failed:', err);
      toast.error(err?.message || 'Failed to export Excel file.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<NewsletterRecord>[] = [
    {
      id: 'email',
      header: 'Email',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[#2C0E11] text-sm truncate" title={row.email}>
            {row.email || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date & Time',
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
      
      <StatGrid className="!grid-cols-1 sm:!grid-cols-1 xl:!grid-cols-1">
        <StatCard
          label="Total Subscribers"
          value={subscribers.length.toString()}
          icon={Mail}
          className="w-full"
        />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={filteredSubscribers}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading newsletter subscribers...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No subscribers yet</span>
              <span className="text-xs text-gray-400">
                Emails from the welcome message and footer will appear here.
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
                  placeholder="Search by email..."
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

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto max-md:justify-end">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting || isLoading || subscribers.length === 0}
                className="flex h-10 sm:h-11 items-center gap-2 px-4 rounded-full bg-[#2C0E11] text-white text-xs font-semibold hover:bg-[#3E1418] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export all subscribers to Excel"
              >
                <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
              </button>
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
      />
    </div>
  );
}
