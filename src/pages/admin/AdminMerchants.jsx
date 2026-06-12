import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { getMerchants, suspendMerchant, activateMerchant, deleteMerchant } from '@/services/merchantService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import ConfirmDialog from '@/components/ui-custom/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Eye, Pause, Play, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMerchants() {
  const { t } = useLanguage();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    getMerchants()
      .then(setMerchants)
      .catch(() => toast.error('Erreur lors du chargement des commerces'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = merchants.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchSearch;
    if (filter === 'active' || filter === 'suspended') return matchSearch && m.status === filter;
    if (filter === 'free') return matchSearch && m.subscription_status === 'free';
    if (filter === 'paid') return matchSearch && m.subscription_status !== 'free' && m.subscription_status != null;
    return matchSearch;
  });

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setActing(true);
    try {
      if (suspendTarget.status === 'active') {
        await suspendMerchant(suspendTarget.id);
        setMerchants(prev => prev.map(m => m.id === suspendTarget.id ? { ...m, status: 'suspended' } : m));
      } else {
        await activateMerchant(suspendTarget.id);
        setMerchants(prev => prev.map(m => m.id === suspendTarget.id ? { ...m, status: 'active' } : m));
      }
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setActing(false);
      setSuspendTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActing(true);
    try {
      await deleteMerchant(deleteTarget.id);
      setMerchants(prev => prev.filter(m => m.id !== deleteTarget.id));
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setActing(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.merchants_title')} action={<Link to="/admin/merchants/new"><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />{t('admin.create_merchant')}</Button></Link>} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('clients.filter_all')}</TabsTrigger>
            <TabsTrigger value="active">{t('admin.filter_active')}</TabsTrigger>
            <TabsTrigger value="suspended">{t('admin.filter_suspended')}</TabsTrigger>
            <TabsTrigger value="free">{t('admin.filter_free')}</TabsTrigger>
            <TabsTrigger value="paid">{t('admin.filter_paid')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun commerce trouvé</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.merchant_name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('admin.owner')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('admin.email')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('admin.business_type')}</TableHead>
                <TableHead>{t('admin.subscription')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead className="text-right">{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{m.owner_name ?? '—'}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{m.email ?? '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell capitalize">{m.business_type ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={m.subscription_status === 'active' ? 'pro' : 'free'}
                      label={m.subscription_status === 'active' ? 'Pro' : 'Free'}
                    />
                  </TableCell>
                  <TableCell><StatusBadge status={m.status} label={t(`common.${m.status}`)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/merchants/${m.id}`}><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSuspendTarget(m)}>
                        {m.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(m)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title={suspendTarget?.status === 'active' ? t('common.confirm_suspend') : 'Réactiver ce commerce ?'}
        description={suspendTarget?.name ?? ''}
        variant="default"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.confirm_delete')}
        description={deleteTarget?.name ?? ''}
      />
    </div>
  );
}
