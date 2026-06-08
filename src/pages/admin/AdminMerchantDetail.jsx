import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import WalletCardPreview from '@/components/wallet/WalletCardPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, CreditCard, Star, ExternalLink } from 'lucide-react';
import { mockMerchants, mockCustomers, mockTransactions } from '@/data/mockData';

export default function AdminMerchantDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const merchant = mockMerchants.find(m => m.id === id) || mockMerchants[0];
  const customers = mockCustomers.filter(c => c.merchantId === merchant.id);
  const transactions = mockTransactions.filter(tx => tx.merchantId === merchant.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={merchant.name}
        subtitle={t('admin.merchant_detail')}
        action={<Link to="/admin/merchants"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button></Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.total_clients')} value={String(merchant.customersCount)} icon={Users} color="blue" />
        <StatCard title={t('admin.total_cards')} value={String(merchant.cardsCount)} icon={CreditCard} color="green" />
        <StatCard title={t('admin.total_points')} value={merchant.pointsDistributed.toLocaleString()} icon={Star} color="purple" />
        {/* <StatCard title={t('admin.subscription')} value={merchant.subscription === 'pro' ? 'Pro' : 'Free'} color="orange" /> */}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('admin.tab_overview')}</TabsTrigger>
          <TabsTrigger value="customers">{t('admin.tab_customers')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('admin.tab_transactions')}</TabsTrigger>
          <TabsTrigger value="card_design">{t('admin.tab_card_design')}</TabsTrigger>
          {/* <TabsTrigger value="subscription">{t('admin.tab_subscription')}</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t('settings_page.business_info')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.owner')}</span><span>{merchant.owner}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.email')}</span><span>{merchant.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.phone')}</span><span>{merchant.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.business_type')}</span><span className="capitalize">{merchant.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.status')}</span><StatusBadge status={merchant.status} label={t(`common.${merchant.status}`)} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.created')}</span><span>{merchant.createdAt}</span></div>
              </div>
            </Card>
            <Card className="border-0 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t('public_page.link')}</h3>
              <p className="text-sm font-mono text-primary">fidelitypro.fr/rejoindre/{merchant.slug}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`/rejoindre/${merchant.slug}`, '_blank')}><ExternalLink className="h-3.5 w-3.5" />{t('public_page.preview_page')}</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('clients.name')}</TableHead><TableHead>{t('clients.phone')}</TableHead><TableHead>{t('clients.points')}</TableHead><TableHead>{t('clients.visits')}</TableHead><TableHead>{t('clients.status')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.phone}</TableCell><TableCell className="font-semibold">{c.points}</TableCell><TableCell>{c.visits}</TableCell>
                    <TableCell><StatusBadge status={c.status} label={t(`clients.${c.status}`)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('transactions.customer')}</TableHead><TableHead>{t('transactions.amount')}</TableHead><TableHead>{t('transactions.points')}</TableHead><TableHead>{t('transactions.date')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.customerName}</TableCell><TableCell>{tx.amount > 0 ? `${tx.amount}€` : '-'}</TableCell>
                    <TableCell className={tx.points >= 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{tx.points >= 0 ? '+' : ''}{tx.points}</TableCell><TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="card_design" className="mt-4">
          <div className="flex justify-center"><WalletCardPreview merchantName={merchant.name} bgColor={merchant.bgColor} textColor={merchant.textColor} accentColor={merchant.accentColor} /></div>
        </TabsContent>

        <TabsContent value="subscription" className="mt-4">
          <Card className="border-0 shadow-sm p-5 space-y-3 max-w-md">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('subscriptions.plan')}</span><StatusBadge status={merchant.subscription} label={merchant.subscription === 'pro' ? 'Pro' : 'Free'} /></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('subscriptions.status')}</span><StatusBadge status="active" label={t('common.active')} /></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('subscriptions.start_date')}</span><span>{merchant.createdAt}</span></div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline">{t('subscriptions.activate')}</Button>
              <Button size="sm" variant="outline">{t('subscriptions.free')}</Button>
              <Button size="sm" variant="outline" className="text-destructive">{t('subscriptions.suspend')}</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}