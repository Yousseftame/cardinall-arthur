import { useMemo, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  CreditCard,
  HelpCircle,
  Mail,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Tags,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { getOrders } from '../../services/orders.service';
import { getProducts } from '../../services/products.service';
import { getCategories } from '../../services/categories.service';
import { getFeedbacks } from '../../services/feedback.service';
import { getContactMessages } from '../../services/contact.service';
import { getCantFindRequests } from '../../services/cantFind.service';
import { getPaidCustomers } from '../../services/paidCustomers.service';
import { getNewsletterSubscribers } from '../../services/newsletter.service';
import type { Order } from '../../types/order';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const BRAND = '#2C0E11';
const GOLD = '#C9A86A';
const MUTED = '#9CA3AF';
const SOFT = '#E8DFD0';

/** Calm supporting tones for smaller order-status slices (largest = black). */
const STATUS_CALM_COLORS = ['#C9B8A4', '#B5A99A', '#D6CFC4', '#9C9084'] as const;

const PAYMENT_COLORS: Record<string, string> = {
  paid: '#2C0E11',
  pending: '#C9B8A4',
  failed: '#B5A99A',
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatEGP(n: number) {
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} EGP`;
}

function ChartTooltip({
  active,
  payload,
  label,
  valuePrefix = '',
  valueSuffix = '',
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_8px_30px_rgba(44,14,17,0.12)] border border-gray-100">
      {label ? <p className="text-[11px] font-semibold text-gray-400 mb-1">{label}</p> : null}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold text-[#2C0E11]">
          <span className="font-medium text-gray-500 mr-1.5">{entry.name}</span>
          {valuePrefix}
          {typeof entry.value === 'number' ? entry.value.toLocaleString('en-US') : entry.value}
          {valueSuffix}
        </p>
      ))}
    </div>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const accountLabel = user?.displayName?.trim() || user?.email || null;

  const ordersQ = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getOrders(200),
    ...adminListQueryOptions,
  });
  const productsQ = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    ...adminListQueryOptions,
  });
  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    ...adminListQueryOptions,
  });
  const feedbackQ = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: getFeedbacks,
    ...adminListQueryOptions,
  });
  const contactQ = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: getContactMessages,
    ...adminListQueryOptions,
  });
  const cantFindQ = useQuery({
    queryKey: ['admin-cant-find'],
    queryFn: getCantFindRequests,
    ...adminListQueryOptions,
  });
  const customersQ = useQuery({
    queryKey: ['admin-paid-customers'],
    queryFn: getPaidCustomers,
    ...adminListQueryOptions,
  });
  const newsletterQ = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: getNewsletterSubscribers,
    ...adminListQueryOptions,
  });

  const isLoading =
    ordersQ.isLoading ||
    productsQ.isLoading ||
    categoriesQ.isLoading ||
    feedbackQ.isLoading ||
    contactQ.isLoading ||
    cantFindQ.isLoading ||
    customersQ.isLoading ||
    newsletterQ.isLoading;

  const isFetching =
    ordersQ.isFetching ||
    productsQ.isFetching ||
    categoriesQ.isFetching ||
    feedbackQ.isFetching ||
    contactQ.isFetching ||
    cantFindQ.isFetching ||
    customersQ.isFetching ||
    newsletterQ.isFetching;

  const orders = ordersQ.data ?? [];
  const products = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const feedbacks = feedbackQ.data ?? [];
  const contacts = contactQ.data ?? [];
  const cantFind = cantFindQ.data ?? [];
  const customers = customersQ.data ?? [];
  const subscribers = newsletterQ.data ?? [];

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const activeProducts = products.filter((p) => p.status === 'active').length;
    const inboxNew =
      feedbacks.filter((f) => f.status === 'new').length +
      contacts.filter((c) => c.status === 'new').length +
      cantFind.filter((c) => c.status === 'new').length;

    return {
      revenue,
      totalOrders: orders.length,
      paidCount: paidOrders.length,
      pendingOrders,
      activeProducts,
      lowStock,
      outOfStock,
      categories: categories.length,
      customers: customers.length,
      subscribers: subscribers.length,
      inboxNew,
    };
  }, [orders, products, categories, feedbacks, contacts, cantFind, customers, subscribers]);

  const revenueSeries = useMemo(() => {
    const days = 14;
    const map = new Map<string, { label: string; revenue: number; orders: number; key: string }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(new Date());
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      if (order.paymentStatus !== 'paid') return;
      const key = startOfDay(new Date(order.createdAt)).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (!bucket) return;
      bucket.revenue += order.pricing?.total || 0;
      bucket.orders += 1;
    });

    return Array.from(map.values());
  }, [orders]);

  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    const entries = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        key: name,
      }));

    // Largest slice = brand black; remaining slices = calm neutrals
    const bySize = [...entries].sort((a, b) => b.value - a.value);
    const colorByKey = new Map<string, string>();
    bySize.forEach((entry, i) => {
      colorByKey.set(
        entry.key,
        i === 0 ? BRAND : STATUS_CALM_COLORS[(i - 1) % STATUS_CALM_COLORS.length]
      );
    });

    return entries.map((entry) => ({
      ...entry,
      color: colorByKey.get(entry.key) || BRAND,
    }));
  }, [orders]);

  const paymentChart = useMemo(() => {
    const counts = { paid: 0, pending: 0, failed: 0 };
    orders.forEach((o) => {
      if (o.paymentStatus in counts) counts[o.paymentStatus as keyof typeof counts] += 1;
    });
    return [
      { name: 'Paid', value: counts.paid, key: 'paid' },
      { name: 'Pending', value: counts.pending, key: 'pending' },
      { name: 'Failed', value: counts.failed, key: 'failed' },
    ];
  }, [orders]);

  const categoryStock = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const name = p.categoryName || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [orders]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const refreshAll = () => {
    void ordersQ.refetch();
    void productsQ.refetch();
    void categoriesQ.refetch();
    void feedbackQ.refetch();
    void contactQ.refetch();
    void cantFindQ.refetch();
    void customersQ.refetch();
    void newsletterQ.refetch();
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-500 pb-6">
      {/* Header */}
      <motion.header
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A86A]/70 to-transparent" />

        <div className="flex flex-col gap-5 p-5 sm:p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex gap-4 sm:gap-5">
            <div className="hidden sm:block w-px self-stretch bg-[#2C0E11]/12 rounded-full" aria-hidden />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2.5">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A7A6A]">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Online
                </span>
                <span className="hidden sm:inline text-[#D4CBBE]">·</span>
                <span className="text-[11px] font-medium tracking-[0.04em] text-[#A89A8C]">
                  {todayLabel}
                </span>
              </div>

              <h2 className="font-heading text-[1.65rem] sm:text-[2rem] font-light tracking-tight text-[#2C0E11] leading-none">
                {greeting}
              </h2>
              {accountLabel ? (
                <p className="mt-1.5 text-xs text-[#A89A8C] font-medium tracking-wide truncate max-w-md">
                  Signed in as {accountLabel}
                </p>
              ) : null}
              <p className="mt-2.5 text-sm text-[#7A7168] leading-relaxed max-w-md font-light">
                Store metrics from orders, catalog, and inbox. Revenue reflects paid payments only.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 self-start sm:self-auto rounded-full border border-[#2C0E11]/12 bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#2C0E11] hover:border-[#2C0E11]/25 hover:bg-[#F8F7F5] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </motion.header>

      {/* KPI cards */}
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-4">
        {[
          {
            label: 'Paid Revenue',
            value: isLoading ? '—' : formatEGP(stats.revenue),
            icon: TrendingUp,
            hint: `${stats.paidCount} paid orders`,
          },
          {
            label: 'Total Orders',
            value: isLoading ? '—' : stats.totalOrders.toString(),
            icon: ShoppingBag,
            hint: `${stats.pendingOrders} in progress`,
          },
          {
            label: 'Active Products',
            value: isLoading ? '—' : stats.activeProducts.toString(),
            icon: Package,
            hint:
              stats.outOfStock > 0
                ? `${stats.outOfStock} out of stock`
                : stats.lowStock > 0
                  ? `${stats.lowStock} low stock`
                  : `${stats.categories} categories`,
          },
          {
            label: 'Audience',
            value: isLoading ? '—' : (stats.customers + stats.subscribers).toString(),
            icon: Users,
            hint: `${stats.customers} customers · ${stats.subscribers} newsletter`,
          },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="show">
            <article className="rounded-[24px] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1 duration-300 h-full">
              <div className="mb-5 flex items-center gap-2 text-[#2C0E11]">
                <card.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="text-sm font-semibold">{card.label}</span>
              </div>
              <p className="text-[1.75rem] sm:text-[2.1rem] leading-none font-bold tracking-tight text-[#2C0E11]">
                {card.value}
              </p>
              <p className="mt-3 text-xs text-gray-400 font-medium">{card.hint}</p>
            </article>
          </motion.div>
        ))}
      </StatGrid>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <motion.section
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="xl:col-span-2 rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Revenue (14 days)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Paid order totals by day</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2C0E11]/6 px-3 py-1 text-[11px] font-bold text-[#2C0E11]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A86A]" />
              Paid only
            </span>
          </div>

          <div className="h-[240px] sm:h-[280px] w-full">
            {revenueSeries.every((d) => d.revenue === 0) && !isLoading ? (
              <EmptyChart label="No paid revenue in the last 14 days yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EFEAE4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: MUTED, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fill: MUTED, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                  />
                  <Tooltip
                    content={<ChartTooltip valueSuffix=" EGP" />}
                    cursor={{ stroke: SOFT, strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={BRAND}
                    strokeWidth={2.5}
                    fill="url(#revFill)"
                    animationDuration={900}
                    activeDot={{ r: 5, fill: GOLD, stroke: BRAND, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>

        <motion.section
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Order Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution across fulfillment</p>
          </div>
          <div className="h-[220px] sm:h-[240px] w-full">
            {statusChart.length === 0 && !isLoading ? (
              <EmptyChart label="No orders yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={800}
                  >
                    {statusChart.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {statusChart.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F7F5] px-2.5 py-1 text-[11px] font-semibold text-gray-600"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name} · {s.value}
              </span>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Second charts + inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <motion.section
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="mb-5">
            <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Payments</h3>
            <p className="text-xs text-gray-400 mt-0.5">Paid vs pending vs failed</p>
          </div>
          <div className="h-[200px] w-full">
            {orders.length === 0 && !isLoading ? (
              <EmptyChart label="No payment data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentChart} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EFEAE4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(44,14,17,0.04)' }} />
                  <Bar dataKey="value" name="Orders" radius={[10, 10, 10, 10]} animationDuration={800}>
                    {paymentChart.map((entry) => (
                      <Cell key={entry.key} fill={PAYMENT_COLORS[entry.key]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>

        <motion.section
          custom={8}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="mb-5">
            <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Products by Category</h3>
            <p className="text-xs text-gray-400 mt-0.5">Catalog mix (top categories)</p>
          </div>
          <div className="h-[200px] w-full">
            {categoryStock.length === 0 && !isLoading ? (
              <EmptyChart label="No products in catalog yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryStock}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 6" stroke="#EFEAE4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(44,14,17,0.04)' }} />
                  <Bar dataKey="value" name="Products" fill={BRAND} radius={[0, 10, 10, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>

        <motion.section
          custom={9}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] lg:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Inbox</h3>
              <p className="text-xs text-gray-400 mt-0.5">Unread customer messages</p>
            </div>
            {stats.inboxNew > 0 ? (
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#2C0E11] px-2 text-xs font-bold text-white">
                {stats.inboxNew}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2.5">
            <InboxLink
              to="/admin/feedback"
              icon={MessageSquare}
              label="Feedback"
              count={feedbacks.filter((f) => f.status === 'new').length}
              total={feedbacks.length}
            />
            <InboxLink
              to="/admin/contact"
              icon={Mail}
              label="Contact Us"
              count={contacts.filter((c) => c.status === 'new').length}
              total={contacts.length}
            />
            <InboxLink
              to="/admin/cant-find"
              icon={Search}
              label="Can't Find It"
              count={cantFind.filter((c) => c.status === 'new').length}
              total={cantFind.length}
            />
            <InboxLink
              to="/admin/newsletter"
              icon={Mail}
              label="Newsletter"
              count={0}
              total={subscribers.length}
              hideNew
            />
          </div>
        </motion.section>
      </div>

      {/* Recent orders + quick links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <motion.section
          custom={10}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="xl:col-span-2 rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2C0E11]">Recent Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest activity across the store</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2C0E11] hover:underline underline-offset-4"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 && !isLoading ? (
            <EmptyChart label="No orders placed yet" />
          ) : (
            <ul className="flex flex-col gap-2">
              {recentOrders.map((order, i) => (
                <motion.li
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.35 }}
                >
                  <RecentOrderRow order={order} />
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>

        <motion.section
          custom={11}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[24px] bg-[#2C0E11] p-5 sm:p-7 text-white shadow-[0_12px_40px_rgba(44,14,17,0.22)]"
        >
          <h3 className="text-base sm:text-lg font-bold mb-1">Quick actions</h3>
          <p className="text-xs text-white/50 mb-5">Jump to common admin tasks</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { to: '/admin/orders', icon: CreditCard, label: 'Orders' },
              { to: '/admin/products', icon: Package, label: 'Products' },
              { to: '/admin/categories', icon: Tags, label: 'Categories' },
              { to: '/admin/customers', icon: UserCheck, label: 'Customers' },
              { to: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
              { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-start gap-2 rounded-2xl bg-white/8 hover:bg-white/14 border border-white/10 px-3.5 py-3.5 transition-colors"
              >
                <item.icon className="h-4 w-4 text-[#C9A86A]" strokeWidth={2} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Compact secondary stats */}
      <StatGrid className="!grid-cols-2 lg:!grid-cols-4">
        <StatCard label="Categories" value={stats.categories} icon={Tags} />
        <StatCard label="Paid Customers" value={stats.customers} icon={UserCheck} />
        <StatCard label="Newsletter" value={stats.subscribers} icon={Mail} />
        <StatCard label="Low Stock" value={stats.lowStock + stats.outOfStock} icon={Package} />
      </StatGrid>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full min-h-[160px] flex items-center justify-center rounded-2xl bg-[#F8F7F5] px-4 text-center">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

function InboxLink({
  to,
  icon: Icon,
  label,
  count,
  total,
  hideNew,
}: {
  to: string;
  icon: ElementType;
  label: string;
  count: number;
  total: number;
  hideNew?: boolean;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl bg-[#F8F7F5] hover:bg-[#F1EEE9] px-3.5 py-3 transition-colors"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2C0E11] shadow-sm">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[#2C0E11] truncate">{label}</span>
        <span className="block text-[11px] text-gray-400">{total} total</span>
      </span>
      {!hideNew && count > 0 ? (
        <span className="shrink-0 rounded-full bg-[#2C0E11] text-white text-[10px] font-bold px-2 py-0.5">
          {count} new
        </span>
      ) : (
        <ArrowUpRight className="h-4 w-4 text-gray-300 shrink-0" />
      )}
    </Link>
  );
}

function RecentOrderRow({ order }: { order: Order }) {
  const name = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer';
  const paid = order.paymentStatus === 'paid';
  const total = order.pricing?.total ?? 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F8F7F5] px-3.5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2C0E11] text-xs font-bold shadow-sm">
        {(order.customer?.firstName?.[0] || 'O').toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#2C0E11] truncate">{name}</p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              paid ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
            )}
          >
            {order.paymentStatus}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate">
          #{order.orderNumber} · {order.status} ·{' '}
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-[#2C0E11] tabular-nums">
        {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        <span className="text-[10px] font-semibold text-gray-400 ml-0.5">EGP</span>
      </p>
    </div>
  );
}
