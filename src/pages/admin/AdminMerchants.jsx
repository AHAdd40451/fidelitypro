import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import ConfirmDialog from '@/components/ui-custom/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Eye, Pencil, Pause, Trash2, LogIn } from 'lucide-react';
import { mockMerchants } from '@/data/mockData';
import { toast } from 'sonner';

export default function AdminMerchants() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = mockMerchants.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchSearch;
    if (filter === 'active' || filter === 'suspended') return matchSearch && m.status === filter;
    if (filter === 'free') return matchSearch && m.subscription === 'free';
    if (filter === 'paid') return matchSearch && m.subscription === 'pro';
    return matchSearch;
  });

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.merchant_name')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('admin.owner')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.email')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('admin.business_type')}</TableHead>
              <TableHead>{t('admin.subscription')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('admin.cards_count')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{m.owner}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{m.email}</TableCell>
                <TableCell className="hidden lg:table-cell capitalize">{m.type}</TableCell>
                <TableCell><StatusBadge status={m.subscription} label={m.subscription === 'pro' ? 'Pro' : 'Free'} /></TableCell>
                <TableCell className="hidden lg:table-cell">{m.cardsCount}</TableCell>
                <TableCell><StatusBadge status={m.status} label={t(`common.${m.status}`)} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link to={`/admin/merchants/${m.id}`}><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSuspendTarget(m)}><Pause className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(m)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success(`Connecté en tant que ${m.name}`)}><LogIn className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog open={!!suspendTarget} onClose={() => setSuspendTarget(null)} onConfirm={() => { toast.success(t('common.action_success')); setSuspendTarget(null); }} title={t('common.confirm_suspend')} description={suspendTarget?.name || ''} variant="default" />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { toast.success(t('common.action_success')); setDeleteTarget(null); }} title={t('common.confirm_delete')} description={deleteTarget?.name || ''} />
    </div>
  );
}