import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { updateSubscription } from '@/services/subscriptionService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    supabase
      .from('subscriptions')
      .select('*, merchants(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setSubscriptions(data ?? []))
      .catch(() => toast.error('Erreur lors du chargement des abonnements'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (sub, newStatus) => {
    setActing(sub.id);
    try {
      await updateSubscription(sub.merchant_id, { status: newStatus });
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('subscriptions.title')} />
      <Card className="border-0 shadow-sm overflow-hidden">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun abonnement</p>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('subscriptions.merchant')}</TableHead>
              <TableHead>{t('subscriptions.plan')}</TableHead>
              <TableHead>{t('subscriptions.status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('subscriptions.start_date')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('subscriptions.renewal_date')}</TableHead>
              <TableHead className="text-right">{t('subscriptions.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {subscriptions.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.merchants?.name ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={s.plan === 'pro' ? 'pro' : 'free'}
                      label={s.plan === 'pro' ? 'Pro' : 'Free'}
                    />
                  </TableCell>
                  <TableCell><StatusBadge status={s.status} label={t(`subscriptions.${s.status}`)} /></TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {s.start_date ? new Date(s.start_date).toLocaleDateString('fr-FR') : '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {s.renewal_date ? new Date(s.renewal_date).toLocaleDateString('fr-FR') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {s.status !== 'active' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={acting === s.id} onClick={() => handleUpdate(s, 'active')}>
                          {acting === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t('subscriptions.activate')}
                        </Button>
                      )}
                      {s.status === 'active' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" disabled={acting === s.id} onClick={() => handleUpdate(s, 'cancelled')}>
                          {acting === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t('subscriptions.suspend')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
