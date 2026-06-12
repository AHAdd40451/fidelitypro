import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getMerchantStats } from '@/services/adminService';
import { supabase } from '@/lib/supabaseClient';
import StatCard from '@/components/ui-custom/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Eye, Gift, Bell, QrCode, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY_CHART = Array.from({ length: 6 }, (_, i) => ({ month: `M${i + 1}`, count: 0, points: 0 }));

export default function MerchantDashboard() {
  const { t } = useLanguage();
  const { profile, merchantId } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantId) return;
    const load = async () => {
      try {
        const [statsData, { data: txData }] = await Promise.all([
          getMerchantStats(merchantId).catch(() => null),
          supabase
            .from('points_transactions')
            .select('*, customers(first_name)')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);
        setStats(statsData);
        setRecentTx(txData ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [merchantId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {profile?.full_name?.split(' ')[0] || 'Marchand'} 👋</h1>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title={t('dashboard.total_clients')} value={String(stats?.total_customers ?? 0)} icon={Users} color="blue" />
        <StatCard title={t('dashboard.points_distributed')} value={String(stats?.total_points_distributed ?? 0)} icon={Star} color="purple" />
        <StatCard title={t('dashboard.visits_recorded')} value={String(stats?.total_visits ?? 0)} icon={Eye} color="green" />
        <StatCard title={t('dashboard.active_offers')} value={String(stats?.active_offers ?? 0)} icon={Gift} color="orange" />
        <StatCard title={t('dashboard.notifications_sent')} value={String(stats?.notifications_sent ?? 0)} icon={Bell} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.clients_over_time')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={EMPTY_CHART}>
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
              <AreaChart data={EMPTY_CHART}>
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
          {recentTx.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
          ) : (
            <div className="space-y-3">
              {recentTx.map(tx => {
                const pts = tx.type === 'redeem' ? -(tx.points_removed ?? 0) : (tx.points_added ?? 0);
                const customerName = tx.customers?.first_name ?? '—';
                const isPositive = pts >= 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'earn' ? 'bg-blue-100 dark:bg-blue-900/30' : tx.type === 'redeem' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                        <QrCode className={`h-4 w-4 ${tx.type === 'earn' ? 'text-blue-600 dark:text-blue-400' : tx.type === 'redeem' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{customerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isPositive ? '+' : ''}{pts} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
