import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Store, CreditCard, Star, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData, mockMerchants } from '@/data/mockData';

export default function AdminDashboard() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.dashboard_title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title={t('admin.total_merchants')} value="5" icon={Store} color="blue" trend="+2" />
        <StatCard title={t('admin.active_merchants')} value="4" icon={Store} color="green" />
        <StatCard title={t('admin.total_customers')} value="836" icon={Users} color="purple" trend="+56" />
        <StatCard title={t('admin.total_cards')} value="756" icon={CreditCard} color="orange" />
        <StatCard title={t('admin.total_points')} value="51 050" icon={Star} color="primary" />
        <StatCard title={t('admin.monthly_revenue')} value="87€" icon={DollarSign} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('admin.merchant_growth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData.merchantGrowth}>
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
              <AreaChart data={chartData.clientsOverTime}>
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
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('admin.merchant_name')}</TableHead><TableHead>{t('admin.owner')}</TableHead><TableHead className="hidden sm:table-cell">{t('admin.business_type')}</TableHead><TableHead>{t('admin.status')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {mockMerchants.slice(0, 4).map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.owner}</TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{m.type}</TableCell>
                  <TableCell><StatusBadge status={m.status} label={t(`common.${m.status}`)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}