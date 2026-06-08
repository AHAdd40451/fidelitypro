import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import EmptyState from '@/components/ui-custom/EmptyState';
import ConfirmDialog from '@/components/ui-custom/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Gift, Pencil, Trash2, Users, Star } from 'lucide-react';
import { mockOffers } from '@/data/mockData';
import { toast } from 'sonner';

export default function MerchantOffers() {
  const { t } = useLanguage();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const offers = mockOffers.filter(o => o.merchantId === '1');

  return (
    <div className="space-y-6">
      <PageHeader title={t('offers.title')} action={<Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />{t('offers.create')}</Button>} />

      {offers.length === 0 ? (
        <EmptyState icon={Gift} title={t('offers.empty')} description={t('offers.empty_desc')} action={<Button size="sm" onClick={() => setShowCreate(true)}>{t('offers.create')}</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(offer => (
            <Card key={offer.id} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <StatusBadge status={offer.status} label={t(`offers.${offer.status}`)} />
              </div>
              <h3 className="font-semibold mb-1">{offer.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{offer.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" />{offer.pointsRequired} pts</span>
                <span className="flex items-center gap-1"><Gift className="h-3 w-3" />{offer.timesRedeemed} {t('offers.times_redeemed')}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{offer.eligible} {t('offers.eligible')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1"><Pencil className="h-3 w-3" />{t('offers.edit')}</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(offer)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('offers.create')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('offers.name')}</Label><Input className="mt-1" /></div>
            <div><Label>{t('offers.points_required')}</Label><Input type="number" className="mt-1" /></div>
            <div><Label>{t('offers.description')}</Label><Textarea className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t('offers.cancel')}</Button>
            <Button onClick={() => { toast.success(t('common.action_success')); setShowCreate(false); }}>{t('offers.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { toast.success(t('common.action_success')); setDeleteTarget(null); }} title={t('common.confirm_delete')} description={deleteTarget?.name || ''} />
    </div>
  );
}