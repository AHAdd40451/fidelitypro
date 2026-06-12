import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { getMerchantById } from '@/services/merchantService';
import { getCustomers } from '@/services/customerService';
import { getCardDesign } from '@/services/cardDesignService';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import WalletCardPreview from '@/components/wallet/WalletCardPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, CreditCard, Star, ExternalLink, Loader2 } from 'lucide-react';

export default function AdminMerchantDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cardDesign, setCardDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [m, c, { data: tx }, cd] = await Promise.all([
          getMerchantById(id),
          getCustomers(id),
          supabase
            .from('points_transactions')
            .select('*, customers(first_name)')
            .eq('merchant_id', id)
            .order('created_at', { ascending: false })
            .limit(20),
          getCardDesign(id).catch(() => null),
        ]);
        setMerchant(m);
        setCustomers(c);
        setTransactions(tx ?? []);
        setCardDesign(cd);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!merchant) {
    return (
      <div className="space-y-4">
        <Link to="/admin/merchants"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button></Link>
        <p className="text-muted-foreground">Commerce introuvable</p>
      </div>
    );
  }

  const totalPoints = transactions.reduce((acc, tx) => acc + (tx.points_added ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={merchant.name}
        subtitle={t('admin.merchant_detail')}
        action={<Link to="/admin/merchants"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button></Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title={t('dashboard.total_clients')} value={String(customers.length)} icon={Users} color="blue" />
        <StatCard title={t('admin.total_cards')} value={String(customers.filter(c => c.wallet_status !== 'none').length)} icon={CreditCard} color="green" />
        <StatCard title={t('admin.total_points')} value={String(totalPoints)} icon={Star} color="purple" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('admin.tab_overview')}</TabsTrigger>
          <TabsTrigger value="customers">{t('admin.tab_customers')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('admin.tab_transactions')}</TabsTrigger>
          <TabsTrigger value="card_design">{t('admin.tab_card_design')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t('settings_page.business_info')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.owner')}</span><span>{merchant.owner_name ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.email')}</span><span>{merchant.email ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.phone')}</span><span>{merchant.phone ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.business_type')}</span><span className="capitalize">{merchant.business_type ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.status')}</span><StatusBadge status={merchant.status} label={t(`common.${merchant.status}`)} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.created')}</span><span>{new Date(merchant.created_at).toLocaleDateString('fr-FR')}</span></div>
              </div>
            </Card>
            <Card className="border-0 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t('public_page.link')}</h3>
              <p className="text-sm font-mono text-primary">fidelitypro.fr/rejoindre/{merchant.slug}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`/rejoindre/${merchant.slug}`, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />{t('public_page.preview_page')}
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun client</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('clients.name')}</TableHead>
                  <TableHead>{t('clients.phone')}</TableHead>
                  <TableHead>{t('clients.points')}</TableHead>
                  <TableHead>{t('clients.visits')}</TableHead>
                  <TableHead>{t('clients.status')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.first_name}</TableCell>
                      <TableCell>{c.phone ?? '—'}</TableCell>
                      <TableCell className="font-semibold">{c.points_balance}</TableCell>
                      <TableCell>{c.visits_count}</TableCell>
                      <TableCell><StatusBadge status={c.status ?? 'active'} label={t(`clients.${c.status ?? 'active'}`)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('transactions.customer')}</TableHead>
                  <TableHead>{t('transactions.amount')}</TableHead>
                  <TableHead>{t('transactions.points')}</TableHead>
                  <TableHead>{t('transactions.date')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {transactions.map(tx => {
                    const pts = tx.type === 'redeem' ? -(tx.points_removed ?? 0) : (tx.points_added ?? 0);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.customers?.first_name ?? '—'}</TableCell>
                        <TableCell>{tx.amount_paid ? `${Number(tx.amount_paid).toFixed(2)}€` : '—'}</TableCell>
                        <TableCell className={pts >= 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                          {pts >= 0 ? '+' : ''}{pts}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="card_design" className="mt-4">
          <div className="flex justify-center">
            <WalletCardPreview
              merchantName={cardDesign?.merchant_name_on_card ?? merchant.name}
              bgColor={cardDesign?.background_color ?? merchant.card_background_color ?? '#1e3a5f'}
              textColor={cardDesign?.text_color ?? merchant.card_text_color ?? '#ffffff'}
              accentColor={cardDesign?.accent_color ?? merchant.accent_color ?? '#f0c040'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
