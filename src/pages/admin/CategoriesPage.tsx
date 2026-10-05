import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable, TableAction } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Folder, Layers, Tag, Edit2, Trash2, Eye, Search, RefreshCw, Plus } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  productsCount: number;
  status: 'Active' | 'Draft';
};

const dummyCategories: Category[] = [
  { id: 'cat-1', name: 'Luxury Handbags', slug: 'luxury-handbags', productsCount: 42, status: 'Active' },
  { id: 'cat-2', name: 'Leather Wallets', slug: 'leather-wallets', productsCount: 18, status: 'Active' },
  { id: 'cat-3', name: 'Travel Accessories', slug: 'travel-accessories', productsCount: 7, status: 'Draft' },
  { id: 'cat-4', name: 'Evening Clutches', slug: 'evening-clutches', productsCount: 15, status: 'Active' },
];

export default function CategoriesPage() {
  const columns: Column<Category>[] = [
    {
      id: 'name',
      header: 'Category Name',
      cell: (row) => <span className="font-bold text-[#2C0E11]">{row.name}</span>,
    },
    {
      id: 'slug',
      header: 'Slug / URL',
      cell: (row) => <span className="text-gray-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded">/{row.slug}</span>,
    },
    {
      id: 'productsCount',
      header: 'Products',
      cell: (row) => <span className="font-semibold text-gray-700">{row.productsCount} items</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
          row.status === 'Active' ? 'bg-[#E8F8EF] text-[#83BF6E]' : 'bg-gray-100 text-gray-500'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* Stats Section */}
      <StatGrid className="xl:grid-cols-3">
        <StatCard
          label="Total Categories"
          value="4"
          icon={Layers}
        />
        <StatCard
          label="Active Categories"
          value="3"
          icon={Tag}
        />
        <StatCard
          label="Total Products"
          value="82"
          icon={Folder}
        />
      </StatGrid>

      {/* Table Section */}
      <DataTable
        columns={columns}
        rows={dummyCategories}
        rowKey={(row) => row.id}
        toolbar={
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search categories..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
              />
            </div>
            
            {/* Refresh Button */}
            <button className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {/* Primary Action Button */}
            <button className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 shadow-sm shrink-0">
              <Plus className="h-4 w-4" />
              Add Category
            </button>
            <button className="inline-flex sm:hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2C0E11] text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 shadow-sm">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        }
        actions={() => (
          <div className="flex items-center gap-1">
            <button title="View" className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button title="Edit" className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button title="Delete" className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        renderExpandedRow={(row) => (
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-[#2C0E11] text-sm">Category Details</h4>
            <p className="text-sm text-gray-600">Quick insights for <strong>{row.name}</strong>. Currently there are {row.productsCount} products under this category which makes up a significant portion of the store catalog.</p>
            <div className="mt-2 flex gap-2">
              <TableAction label="Quick Edit" />
              <TableAction label="View Products" tone="primary" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
