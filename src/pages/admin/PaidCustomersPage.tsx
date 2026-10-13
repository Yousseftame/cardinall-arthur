import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { 
  getPaidCustomers, 
  type PaidCustomerRecord,
} from '../../services/paidCustomers.service';
import { exportToExcel, formatExportDateTime } from '../../lib/exportExcel';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  User, 
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaidCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: customers = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-paid-customers'],
    queryFn: getPaidCustomers,
    ...adminListQueryOptions,
  });

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const q = searchQuery.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleExport = () => {
    if (!customers.length) {
      toast.error('No customers to export.');
      return;
    }

    setIsExporting(true);
    try {
      const rows = customers.map((c, index) => ({
        '#': index + 1,
        'Customer Name': c.name || '',
        Email: c.email || '',
        Phone: c.phone || '',
        'Date Added': formatExportDateTime(c.createdAt),
      }));

      exportToExcel(rows, 'paid-customers', 'Paid Customers');
      toast.success(`Exported ${customers.length} customer${customers.length === 1 ? '' : 's'} to Excel.`);
    } catch (err: any) {
      console.error('Paid customers export failed:', err);
      toast.error(err?.message || 'Failed to export Excel file.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<PaidCustomerRecord>[] = [
    {
      id: 'name',
      header: 'Customer Name',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#2C0E11] text-sm truncate">{row.name || 'Customer'}</span>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[260px]" title={row.email}>
            {row.email || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-mono">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{row.phone || '—'}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date Added',
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
          label="Total Customers"
          value={customers.length.toString()}
          icon={Users}
          className="w-full"
        />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={filteredCustomers}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading paid customers...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No paid customers found</span>
              <span className="text-xs text-gray-400">
                Customers who complete checkout will appear here.
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
                  placeholder="Search by name, email, or phone..."
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
                disabled={isExporting || isLoading || customers.length === 0}
                className="flex h-10 sm:h-11 items-center gap-2 px-4 rounded-full bg-[#2C0E11] text-white text-xs font-semibold hover:bg-[#3E1418] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export all customers to Excel"
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
