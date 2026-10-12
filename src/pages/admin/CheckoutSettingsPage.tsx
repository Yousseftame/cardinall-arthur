import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { 
  getCheckoutSettings, 
  updateCheckoutSettings 
} from '../../services/checkoutSettings.service';
import type { CheckoutSettings, GovernorateRate } from '../../types/order';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Save, 
  RefreshCw, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutSettingsPage() {
  const queryClient = useQueryClient();

  const { data: initialSettings, isLoading, refetch } = useQuery({
    queryKey: ['admin-checkout-settings'],
    queryFn: getCheckoutSettings,
    staleTime: 1000 * 60 * 5,
  });

  const [formData, setFormData] = useState<CheckoutSettings | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const saveMutation = useMutation({
    mutationFn: (newSettings: CheckoutSettings) => updateCheckoutSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checkout-settings'] });
      toast.success('Checkout settings saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save settings.');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    saveMutation.mutate(formData);
  };

  const handleGovernorateFeeChange = (id: string, newFee: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      governorates: formData.governorates.map(gov => 
        gov.id === id ? { ...gov, shippingFee: Math.max(0, newFee) } : gov
      )
    });
  };

  const handleGovernorateToggle = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      governorates: formData.governorates.map(gov => 
        gov.id === id ? { ...gov, active: !gov.active } : gov
      )
    });
  };

  const governorateColumns: Column<GovernorateRate>[] = [
    {
      id: 'name',
      header: 'Governorate / Region',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#2C0E11]/70" />
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      id: 'shippingFee',
      header: 'Delivery Fee (EGP)',
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[140px]">
          <input
            type="number"
            min="0"
            step="5"
            value={row.shippingFee}
            onChange={(e) => handleGovernorateFeeChange(row.id, Number(e.target.value))}
            className="w-24 px-3 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#2C0E11] focus:bg-white transition-colors"
          />
          <span className="text-xs text-gray-500 font-medium">EGP</span>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Delivery Status',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleGovernorateToggle(row.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            row.active 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${row.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {row.active ? 'Available' : 'Disabled'}
        </button>
      ),
    },
  ];

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#2C0E11] animate-spin" />
      </div>
    );
  }

  const activeGovCount = formData.governorates.filter(g => g.active).length;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 animate-in fade-in duration-500 pb-16">
      
      {/* Top Banner / Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#2C0E11] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#2C0E11]" />
            Checkout & Shipping Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage delivery fees, threshold rules, payment methods, and governorates rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
            title="Reload settings"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white transition-all hover:bg-[#2C0E11]/90 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saveMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <StatGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Standard Delivery Fee"
          value={`${formData.standardShippingFee} EGP`}
          icon={Truck}
        />
        <StatCard
          label="Free Delivery Over"
          value={formData.freeShippingThreshold > 0 ? `${formData.freeShippingThreshold} EGP` : 'Disabled'}
          icon={Sparkles}
        />
        <StatCard
          label="Active Payment Methods"
          value={`${(formData.enableCod ? 1 : 0) + (formData.enableCard ? 1 : 0)} of 2`}
          icon={CreditCard}
        />
        <StatCard
          label="Available Governorates"
          value={`${activeGovCount} of ${formData.governorates.length}`}
          icon={MapPin}
        />
      </StatGrid>

      {/* Section 1: Delivery Rules */}
      <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#2C0E11]/8 flex items-center justify-center text-[#2C0E11]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#2C0E11] text-base">Standard Shipping & Thresholds</h3>
            <p className="text-xs text-gray-500">Global delivery charges applied during customer checkout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Default Shipping Fee
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.standardShippingFee}
                onChange={(e) => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-[#2C0E11] focus:bg-white transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                EGP
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">Applied when no governorate-specific rate matches.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Free Shipping Minimum Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-[#2C0E11] focus:bg-white transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                EGP
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">Set to 0 to disable free delivery on orders.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Estimated Delivery Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.deliveryTimeEstimate}
                onChange={(e) => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })}
                placeholder="1 to 3 business days"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-[#2C0E11] focus:bg-white transition-all"
              />
              <Clock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">Displayed on checkout page beside shipping method.</p>
          </div>

        </div>
      </div>

      {/* Section 2: Payment Gateways */}
      <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#2C0E11]/8 flex items-center justify-center text-[#2C0E11]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#2C0E11] text-base">Payment Methods</h3>
            <p className="text-xs text-gray-500">Enable or disable checkout payment channels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COD Box */}
          <div className={`p-5 rounded-2xl border transition-all ${formData.enableCod ? 'bg-[#FCFBF8] border-[#2C0E11]/30' : 'bg-gray-50/50 border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Allow customers to pay in cash upon receiving their luxury items at their doorstep.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  checked={formData.enableCod}
                  onChange={(e) => setFormData({ ...formData, enableCod: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2C0E11]"></div>
              </label>
            </div>
          </div>

          {/* Online Cards Box */}
          <div className={`p-5 rounded-2xl border transition-all ${formData.enableCard ? 'bg-[#FCFBF8] border-[#2C0E11]/30' : 'bg-gray-50/50 border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">Debit / Credit Cards</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase">Gateway</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Visa, Mastercard, OmanNet & Digital Wallets online payment processing.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  checked={formData.enableCard}
                  onChange={(e) => setFormData({ ...formData, enableCard: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2C0E11]"></div>
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Governorate Rates Table */}
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#2C0E11]">Governorates & Delivery Rates</h3>
            <p className="text-xs text-gray-500">Configure custom shipping fees and availability per governorate</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 w-fit">
            {activeGovCount} Active Destinations
          </span>
        </div>

        <DataTable
          columns={governorateColumns}
          rows={formData.governorates}
          rowKey={(row) => row.id}
        />
      </div>

      {/* Section 4: Store Support Contact */}
      <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#2C0E11]/8 flex items-center justify-center text-[#2C0E11]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#2C0E11] text-base">Store Support & Checkout Notifications</h3>
            <p className="text-xs text-gray-500">Customer care details displayed on order confirmations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Support Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-[#2C0E11] focus:bg-white transition-all"
                required
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Support Hotline / Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:border-[#2C0E11] focus:bg-white transition-all"
                required
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Floating Bar at Bottom */}
      <div className="sticky bottom-6 z-20 flex justify-end">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-[#2C0E11] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2C0E11]/90 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 cursor-pointer"
        >
          {saveMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Checkout Settings
        </button>
      </div>

    </form>
  );
}
