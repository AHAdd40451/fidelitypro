import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import ConfirmDialog from '@/components/ui-custom/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Ban } from 'lucide-react';
import { mockAdmins } from '@/data/mockData';
import { toast } from 'sonner';

export default function SuperadminAdmins() {
  const { t } = useLanguage();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader title={t('superadmin.admins_title')} action={<Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />{t('superadmin.create_admin')}</Button>} />
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t('superadmin.name')}</TableHead><TableHead>{t('superadmin.email')}</TableHead><TableHead>{t('superadmin.role')}</TableHead>
            <TableHead>{t('superadmin.status')}</TableHead><TableHead className="hidden sm:table-cell">{t('superadmin.last_login')}</TableHead><TableHead className="text-right">{t('superadmin.actions')}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {mockAdmins.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell><TableCell>{a.email}</TableCell>
                <TableCell><StatusBadge status={a.role === 'superadmin' ? 'pro' : a.role === 'admin' ? 'active' : 'synced'} label={a.role} /></TableCell>
                <TableCell><StatusBadge status={a.status} label={t(`common.${a.status}`)} /></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{a.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Ban className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('superadmin.create_admin')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('superadmin.name')}</Label><Input className="mt-1" /></div>
            <div><Label>{t('superadmin.email')}</Label><Input type="email" className="mt-1" /></div>
            <div><Label>{t('superadmin.role')}</Label>
              <Select defaultValue="admin"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="support">Support</SelectItem><SelectItem value="superadmin">Superadmin</SelectItem></SelectContent>
              </Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { toast.success(t('common.action_success')); setShowCreate(false); }}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { toast.success(t('common.action_success')); setDeleteTarget(null); }} title={t('common.confirm_delete')} description={deleteTarget?.name || ''} />
    </div>
  );
}