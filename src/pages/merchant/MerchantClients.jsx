import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
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
import { Search, Download, Eye, Pencil, Trash2, Users, Smartphone, QrCode } from 'lucide-react';
import { mockCustomers } from '@/data/mockData';
import { toast } from 'sonner';

export default function MerchantClients() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const customers = mockCustomers.filter(c => c.merchantId === '1');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

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
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{c.email || '-'}</TableCell>
                  <TableCell className="font-semibold">{c.points}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.visits}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{c.lastVisit}</TableCell>
                  <TableCell><StatusBadge status={c.status} label={t(`clients.${c.status}`)} /></TableCell>
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

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('clients.detail_title')}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('clients.name')}</span><p className="font-medium">{selected.name}</p></div>
                <div><span className="text-muted-foreground">{t('clients.phone')}</span><p className="font-medium">{selected.phone}</p></div>
                <div><span className="text-muted-foreground">{t('clients.email')}</span><p className="font-medium">{selected.email || '-'}</p></div>
                <div><span className="text-muted-foreground">{t('clients.points_balance')}</span><p className="font-semibold text-primary text-lg">{selected.points}</p></div>
                <div><span className="text-muted-foreground">{t('clients.visits')}</span><p className="font-medium">{selected.visits}</p></div>
                <div><span className="text-muted-foreground">{t('clients.last_visit')}</span><p className="font-medium">{selected.lastVisit}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted space-y-2 text-xs">
                <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" />{t('clients.apple_serial')}: <span className="font-mono">{selected.appleSerial}</span></div>
                <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" />{t('clients.google_id')}: <span className="font-mono">{selected.googleId}</span></div>
                <div className="flex items-center gap-2"><QrCode className="h-3.5 w-3.5" />{t('clients.qr_token')}: <span className="font-mono">{selected.qrToken}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { toast.success(t('common.action_success')); setDeleteTarget(null); }} title={t('common.confirm_delete')} description={deleteTarget ? `${deleteTarget.name}` : ''} />
    </div>
  );
}