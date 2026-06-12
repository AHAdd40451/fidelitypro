import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getCustomers, deleteCustomer } from '@/services/customerService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import EmptyState from '@/components/ui-custom/EmptyState';
import ConfirmDialog from '@/components/ui-custom/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Eye, Trash2, Users, Smartphone, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantClients() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    getCustomers(merchantId)
      .then(setCustomers)
      .catch(() => toast.error('Erreur lors du chargement des clients'))
      .finally(() => setLoading(false));
  }, [merchantId]);

  const filtered = customers.filter(c => {
    const name = c.first_name?.toLowerCase() ?? '';
    const phone = c.phone ?? '';
    const matchSearch = name.includes(search.toLowerCase()) || phone.includes(search);
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('clients.title')} action={<Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />{t('clients.export')}</Button>} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('clients.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('clients.filter_all')}</TabsTrigger>
            <TabsTrigger value="active">{t('clients.filter_active')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('clients.filter_inactive')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={t('clients.empty')} description={t('clients.empty_desc')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('clients.phone')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('clients.email')}</TableHead>
                <TableHead>{t('clients.points')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('clients.visits')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('clients.last_visit')}</TableHead>
                <TableHead>{t('clients.status')}</TableHead>
                <TableHead className="text-right">{t('clients.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(c)}>
                  <TableCell className="font-medium">{c.first_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.phone ?? '—'}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{c.email ?? '—'}</TableCell>
                  <TableCell className="font-semibold">{c.points_balance}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.visits_count}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('fr-FR') : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={c.status ?? 'active'} label={t(`clients.${c.status ?? 'active'}`)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setSelected(c); }}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget(c); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('clients.detail_title')}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('clients.name')}</span><p className="font-medium">{selected.first_name}</p></div>
                <div><span className="text-muted-foreground">{t('clients.phone')}</span><p className="font-medium">{selected.phone ?? '—'}</p></div>
                <div><span className="text-muted-foreground">{t('clients.email')}</span><p className="font-medium">{selected.email ?? '—'}</p></div>
                <div><span className="text-muted-foreground">{t('clients.points_balance')}</span><p className="font-semibold text-primary text-lg">{selected.points_balance}</p></div>
                <div><span className="text-muted-foreground">{t('clients.visits')}</span><p className="font-medium">{selected.visits_count}</p></div>
                <div><span className="text-muted-foreground">{t('clients.last_visit')}</span><p className="font-medium">{selected.last_visit_at ? new Date(selected.last_visit_at).toLocaleDateString('fr-FR') : '—'}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted space-y-2 text-xs">
                <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" />{t('clients.apple_serial')}: <span className="font-mono">{selected.apple_pass_serial ?? '—'}</span></div>
                <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" />{t('clients.google_id')}: <span className="font-mono">{selected.google_wallet_id ?? '—'}</span></div>
                <div className="flex items-center gap-2"><QrCode className="h-3.5 w-3.5" />{t('clients.qr_token')}: <span className="font-mono">{selected.qr_code_token}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.confirm_delete')}
        description={deleteTarget?.first_name ?? ''}
      />
    </div>
  );
}
