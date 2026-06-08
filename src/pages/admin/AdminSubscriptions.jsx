import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockSubscriptions } from '@/data/mockData';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <PageHeader title={t('subscriptions.title')} />
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t('subscriptions.merchant')}</TableHead>
            <TableHead>{t('subscriptions.plan')}</TableHead>
            <TableHead>{t('subscriptions.status')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('subscriptions.price')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('subscriptions.start_date')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('subscriptions.renewal_date')}</TableHead>
            <TableHead className="text-right">{t('subscriptions.actions')}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {mockSubscriptions.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.merchantName}</TableCell>
                <TableCell><StatusBadge status={s.plan === 'Pro' ? 'pro' : 'free'} label={s.plan} /></TableCell>
                <TableCell><StatusBadge status={s.status} label={t(`subscriptions.${s.status}`)} /></TableCell>
                <TableCell className="hidden sm:table-cell">{s.price}€</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.startDate}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.renewalDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.success(t('common.action_success'))}>{t('subscriptions.activate')}</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => toast.success(t('common.action_success'))}>{t('subscriptions.suspend')}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}