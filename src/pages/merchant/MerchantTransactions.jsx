import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getTransactions } from '@/services/pointsService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function MerchantTransactions() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!merchantId) return;
    const load = async () => {
      try {
        const { data } = await supabase
          .from('points_transactions')
          .select('*, customers(first_name)')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false });
        setTransactions(data ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [merchantId]);

  const filtered = typeFilter === 'all' ? transactions : transactions.filter(tx => tx.type === typeFilter);

  const getPoints = (tx) => {
    if (tx.type === 'redeem') return -(tx.points_removed ?? 0);
    return tx.points_added ?? 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('transactions.title')} />
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('transactions.filter_type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('clients.filter_all')}</SelectItem>
            <SelectItem value="earn">{t('transactions.type_purchase')}</SelectItem>
            <SelectItem value="redeem">{t('transactions.type_reward')}</SelectItem>
            <SelectItem value="bonus">{t('transactions.type_bonus')}</SelectItem>
            <SelectItem value="adjust">Ajustement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="border-0 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('transactions.customer')}</TableHead>
                <TableHead>{t('transactions.amount')}</TableHead>
                <TableHead>{t('transactions.points')}</TableHead>
                <TableHead>{t('transactions.type')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('transactions.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(tx => {
                const pts = getPoints(tx);
                const customerName = tx.customers?.first_name ?? '—';
                const typeLabel = tx.type === 'earn' ? t('transactions.type_purchase') : tx.type === 'redeem' ? t('transactions.type_reward') : tx.type === 'bonus' ? t('transactions.type_bonus') : tx.type;
                const badgeStatus = tx.type === 'earn' ? 'active' : tx.type === 'redeem' ? 'suspended' : 'synced';
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{customerName}</TableCell>
                    <TableCell>{tx.amount_paid ? `${Number(tx.amount_paid).toFixed(2)}€` : '—'}</TableCell>
                    <TableCell className={`font-semibold ${pts >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {pts >= 0 ? '+' : ''}{pts}
                    </TableCell>
                    <TableCell><StatusBadge status={badgeStatus} label={typeLabel} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
