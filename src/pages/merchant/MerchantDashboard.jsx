import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import StatCard from '@/components/ui-custom/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Eye, Gift, Bell, UserPlus, QrCode } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData, mockTransactions, mockCustomers } from '@/data/mockData';

export default function MerchantDashboard() {
  const { t } = useLanguage();
  const recent = mockTransactions.filter(tx => tx.merchantId === '1').slice(0, 5);
  const recentCustomers = mockCustomers.filter(c => c.merchantId === '1').slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, Pierre 👋</h1>
        <p className="text-sm text-muted-foreground">Café Le Central</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title={t('dashboard.total_clients')} value="234" icon={Users} color="blue" trend="+12%" />
        <StatCard title={t('dashboard.points_distributed')} value="14 520" icon={Star} color="purple" trend="+8%" />
        <StatCard title={t('dashboard.visits_recorded')} value="1 230" icon={Eye} color="green" />
        <StatCard title={t('dashboard.active_offers')} value="2" icon={Gift} color="orange" />
        <StatCard title={t('dashboard.notifications_sent')} value="3" icon={Bell} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.clients_over_time')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.clientsOverTime}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(234,85%,60%)" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(234,85%,60%)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(234,85%,60%)" fill="url(#cg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.points_over_time')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.pointsOverTime}>
                <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(280,65%,60%)" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(280,65%,60%)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="points" stroke="hsl(280,65%,60%)" fill="url(#pg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.recent_activity')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'purchase' ? 'bg-blue-100 dark:bg-blue-900/30' : tx.type === 'reward' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                    {tx.type === 'purchase' ? <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : tx.type === 'reward' ? <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" /> : <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.customerName}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.points >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {tx.points >= 0 ? '+' : ''}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}