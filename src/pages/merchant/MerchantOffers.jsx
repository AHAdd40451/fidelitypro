import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getOffers, createOffer, updateOffer, deleteOffer } from '@/services/offersService';
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
import { Plus, Gift, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantOffers() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: '', points_required: '', description: '' });

  useEffect(() => {
    if (!merchantId) return;
    getOffers(merchantId)
      .then(setOffers)
      .catch(() => toast.error('Erreur lors du chargement des offres'))
      .finally(() => setLoading(false));
  }, [merchantId]);

  const openCreate = () => {
    setForm({ label: '', points_required: '', description: '' });
    setEditTarget(null);
    setShowCreate(true);
  };

  const openEdit = (offer) => {
    setForm({ label: offer.label, points_required: String(offer.points_required), description: offer.description ?? '' });
    setEditTarget(offer);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.label || !form.points_required) return;
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateOffer(editTarget.id, {
          label: form.label,
          points_required: parseInt(form.points_required),
          description: form.description || null,
        });
        setOffers(prev => prev.map(o => o.id === updated.id ? updated : o));
      } else {
        const created = await createOffer({
          merchant_id: merchantId,
          label: form.label,
          points_required: parseInt(form.points_required),
          description: form.description || null,
        });
        setOffers(prev => [created, ...prev]);
      }
      toast.success(t('common.action_success'));
      setShowCreate(false);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOffer(deleteTarget.id);
      setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('offers.title')} action={<Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />{t('offers.create')}</Button>} />

      {offers.length === 0 ? (
        <EmptyState icon={Gift} title={t('offers.empty')} description={t('offers.empty_desc')} action={<Button size="sm" onClick={openCreate}>{t('offers.create')}</Button>} />
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
              <h3 className="font-semibold mb-1">{offer.label}</h3>
              <p className="text-xs text-muted-foreground mb-3">{offer.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" />{offer.points_required} pts</span>
                <span className="flex items-center gap-1"><Gift className="h-3 w-3" />{offer.times_redeemed} {t('offers.times_redeemed')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(offer)}><Pencil className="h-3 w-3" />{t('offers.edit')}</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(offer)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? t('offers.edit') : t('offers.create')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('offers.name')}</Label><Input className="mt-1" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
            <div><Label>{t('offers.points_required')}</Label><Input type="number" className="mt-1" value={form.points_required} onChange={e => setForm(f => ({ ...f, points_required: e.target.value }))} /></div>
            <div><Label>{t('offers.description')}</Label><Textarea className="mt-1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t('offers.cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('offers.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('common.confirm_delete')} description={deleteTarget?.label ?? ''} />
    </div>
  );
}
