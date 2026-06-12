import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getNotifications, createNotification, sendNotification } from '@/services/notificationsService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Send, Save, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantNotifications() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', target: 'all' });

  useEffect(() => {
    if (!merchantId) return;
    getNotifications(merchantId)
      .then(setNotifications)
      .catch(() => toast.error('Erreur lors du chargement des notifications'))
      .finally(() => setLoading(false));
  }, [merchantId]);

  const handleSaveDraft = async () => {
    if (!form.title || !merchantId) return;
    setSaving(true);
    try {
      const created = await createNotification({
        merchant_id: merchantId,
        title: form.title,
        message: form.body,
        target_type: form.target,
      });
      setNotifications(prev => [created, ...prev]);
      setForm({ title: '', body: '', target: 'all' });
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!form.title || !form.body || !merchantId) return;
    setSending(true);
    try {
      const created = await createNotification({
        merchant_id: merchantId,
        title: form.title,
        message: form.body,
        target_type: form.target,
      });
      const result = await sendNotification(created.id, merchantId, form.title, form.body, form.target);
      setNotifications(prev => [{ ...created, status: 'sent', recipients_count: result.recipients_count }, ...prev]);
      setForm({ title: '', body: '', target: 'all' });
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications_page.title')} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('notifications_page.create')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('notifications_page.message_title')}</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
            <div><Label>{t('notifications_page.message_body')}</Label><Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="mt-1" rows={4} /></div>
            <div>
              <Label>{t('notifications_page.target')}</Label>
              <Select value={form.target} onValueChange={v => setForm({...form, target: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications_page.target_all')}</SelectItem>
                  <SelectItem value="segment">{t('notifications_page.target_points')}</SelectItem>
                  <SelectItem value="individual">{t('notifications_page.target_inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-start gap-2">
              <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('notifications_page.via_passkit')}</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={handleSend} disabled={sending || !form.title || !form.body}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t('notifications_page.send')}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={saving || !form.title}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('notifications_page.save_draft')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('notifications_page.history')}</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune notification</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('notifications_page.message_title')}</TableHead>
                    <TableHead>{t('notifications_page.recipients')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('notifications_page.date')}</TableHead>
                    <TableHead>{t('notifications_page.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell>{n.recipients_count ?? 0}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell><StatusBadge status={n.status} label={t(`notifications_page.${n.status}`)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
