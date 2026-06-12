import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getMerchants } from '@/services/merchantService';
import { createNotification, sendNotification } from '@/services/notificationsService';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotifications() {
  const { t } = useLanguage();
  const [merchants, setMerchants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ merchant_id: '', title: '', body: '', target: 'all' });

  useEffect(() => {
    Promise.all([
      getMerchants().catch(() => []),
      supabase
        .from('notifications')
        .select('*, merchants(name)')
        .order('created_at', { ascending: false })
        .limit(50),
    ]).then(([m, { data: n }]) => {
      setMerchants(m);
      setNotifications(n ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!form.merchant_id || !form.title || !form.body) return;
    setSending(true);
    try {
      const created = await createNotification({
        merchant_id: form.merchant_id,
        title: form.title,
        message: form.body,
        target_type: form.target,
      });
      const result = await sendNotification(created.id, form.merchant_id, form.title, form.body, form.target);
      setNotifications(prev => [{ ...created, status: 'sent', recipients_count: result.recipients_count, merchants: { name: merchants.find(m => m.id === form.merchant_id)?.name } }, ...prev]);
      setForm({ merchant_id: '', title: '', body: '', target: 'all' });
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
            <div>
              <Label>{t('passkit.sync_merchant')}</Label>
              <Select value={form.merchant_id} onValueChange={v => setForm(f => ({ ...f, merchant_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un commerce..." /></SelectTrigger>
                <SelectContent>
                  {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t('notifications_page.message_title')}</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>{t('notifications_page.message_body')}</Label><Textarea className="mt-1" rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
            <div>
              <Label>{t('notifications_page.target')}</Label>
              <Select value={form.target} onValueChange={v => setForm(f => ({ ...f, target: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications_page.target_all')}</SelectItem>
                  <SelectItem value="segment">{t('notifications_page.target_points')}</SelectItem>
                  <SelectItem value="individual">{t('notifications_page.target_inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={handleSend} disabled={sending || !form.merchant_id || !form.title || !form.body}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t('notifications_page.send')}
            </Button>
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
                <TableHeader><TableRow>
                  <TableHead>{t('notifications_page.message_title')}</TableHead>
                  <TableHead>Commerce</TableHead>
                  <TableHead>{t('notifications_page.recipients')}</TableHead>
                  <TableHead>{t('notifications_page.status')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{n.merchants?.name ?? '—'}</TableCell>
                      <TableCell>{n.recipients_count ?? 0}</TableCell>
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
