import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTransactions } from '@/data/mockData';

export default function MerchantTransactions() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState('all');
  const txs = mockTransactions.filter(tx => tx.merchantId === '1');
  const filtered = typeFilter === 'all' ? txs : txs.filter(tx => tx.type === typeFilter);

  return (
    <div className="space-y-6">
      <PageHeader title={t('transactions.title')} />
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('transactions.filter_type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('clients.filter_all')}</SelectItem>
            <SelectItem value="purchase">{t('transactions.type_purchase')}</SelectItem>
            <SelectItem value="visit">{t('transactions.type_visit')}</SelectItem>
            <SelectItem value="reward">{t('transactions.type_reward')}</SelectItem>
            <SelectItem value="bonus">{t('transactions.type_bonus')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('transactions.customer')}</TableHead>
              <TableHead>{t('transactions.amount')}</TableHead>
              <TableHead>{t('transactions.points')}</TableHead>
              <TableHead>{t('transactions.type')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('transactions.date')}</TableHead>
              <TableHead>{t('transactions.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.customerName}</TableCell>
                <TableCell>{tx.amount > 0 ? `${tx.amount.toFixed(2)}€` : '-'}</TableCell>
                <TableCell className={`font-semibold ${tx.points >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{tx.points >= 0 ? '+' : ''}{tx.points}</TableCell>
                <TableCell><StatusBadge status={tx.type === 'purchase' ? 'active' : tx.type === 'reward' ? 'suspended' : 'synced'} label={t(`transactions.type_${tx.type}`)} /></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{tx.date}</TableCell>
                <TableCell><StatusBadge status={tx.status} label={t(`transactions.status_${tx.status}`)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}