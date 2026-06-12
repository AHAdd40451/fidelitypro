import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getDashboardStats } from '@/services/adminService';
import { getMerchants } from '@/services/merchantService';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Store, CreditCard, Star, DollarSign, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY_CHART = Array.from({ length: 6 }, (_, i) => ({ month: `M${i + 1}`, count: 0 }));

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats().catch(() => null),
      getMerchants().catch(() => []),
    ]).then(([s, m]) => {
      setStats(s);
      setMerchants(m.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.dashboard_title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title={t('admin.total_merchants')} value={String(stats?.total_merchants ?? 0)} icon={Store} color="blue" />
        <StatCard title={t('admin.active_merchants')} value={String(stats?.active_merchants ?? 0)} icon={Store} color="green" />
        <StatCard title={t('admin.total_customers')} value={String(stats?.total_customers ?? 0)} icon={Users} color="purple" />
        <StatCard title={t('admin.total_cards')} value={String(stats?.total_wallet_cards ?? 0)} icon={CreditCard} color="orange" />
        <StatCard title={t('admin.total_points')} value={String(stats?.total_points_distributed ?? 0)} icon={Star} color="primary" />
        <StatCard title={t('admin.monthly_revenue')} value={`${stats?.monthly_revenue ?? 0}€`} icon={DollarSign} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('admin.merchant_growth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={EMPTY_CHART}>
                <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(234,85%,60%)" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(234,85%,60%)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,90%)" /><XAxis dataKey="month" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} /><Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(234,85%,60%)" fill="url(#mg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('admin.customer_growth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={EMPTY_CHART}>
                <defs><linearGradient id="cga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,60%,45%)" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(160,60%,45%)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,90%)" /><XAxis dataKey="month" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} /><Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(160,60%,45%)" fill="url(#cga)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm">{t('admin.recent_merchants')}</CardTitle></CardHeader>
        <CardContent>
          {merchants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun commerce</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('admin.merchant_name')}</TableHead>
                <TableHead>{t('admin.owner')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('admin.business_type')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {merchants.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.owner_name ?? '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell capitalize">{m.business_type ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={m.status} label={t(`common.${m.status}`)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
