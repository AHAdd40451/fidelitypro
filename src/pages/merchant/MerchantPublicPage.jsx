import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getMyMerchant, updateMerchant } from '@/services/merchantService';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, ExternalLink, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPublicPage() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [merchant, setMerchant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: '', welcome_message: '' });
  const [toggles, setToggles] = useState({
    phone_required: true,
    email_required: false,
    apple_wallet_enabled: true,
    google_wallet_enabled: true,
  });

  useEffect(() => {
    if (!merchantId) return;
    const load = async () => {
      try {
        const [m, { data: s }] = await Promise.all([
          getMyMerchant(),
          supabase.from('merchant_settings').select('*').eq('merchant_id', merchantId).single(),
        ]);
        if (m) {
          setMerchant(m);
          setForm({ slug: m.slug ?? '', welcome_message: m.welcome_message ?? '' });
        }
        if (s) {
          setSettings(s);
          setToggles({
            phone_required: s.phone_required ?? true,
            email_required: s.email_required ?? false,
            apple_wallet_enabled: s.apple_wallet_enabled ?? true,
            google_wallet_enabled: s.google_wallet_enabled ?? true,
          });
        }
      } catch {
        // settings may not exist yet — use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [merchantId]);

  const link = merchant ? `fidelitypro.fr/rejoindre/${merchant.slug}` : '—';

  const handleSave = async () => {
    if (!merchantId || !merchant) return;
    setSaving(true);
    try {
      await updateMerchant(merchantId, {
        slug: form.slug,
        welcome_message: form.welcome_message,
      });
      const { error } = await supabase
        .from('merchant_settings')
        .upsert({ merchant_id: merchantId, ...toggles }, { onConflict: 'merchant_id' });
      if (error) throw error;
      setMerchant(prev => ({ ...prev, ...form }));
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('public_page.title')} />

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">{t('public_page.link')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={link} className="font-mono text-sm" />
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => { navigator.clipboard.writeText('https://' + link); toast.success(t('public_page.link_copied')); }}>
              <Copy className="h-4 w-4" />{t('public_page.copy_link')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />{t('public_page.download_qr')}</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => merchant && window.open(`/rejoindre/${merchant.slug}`, '_blank')}><ExternalLink className="h-4 w-4" />{t('public_page.preview_page')}</Button>
          </div>
          <div className="flex justify-center py-6">
            <div className="w-40 h-40 rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">{t('settings_page.title')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('public_page.slug')}</Label>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="mt-1 font-mono" />
          </div>
          <div>
            <Label>{t('public_page.welcome_msg')}</Label>
            <Input value={form.welcome_message} onChange={e => setForm(f => ({ ...f, welcome_message: e.target.value }))} className="mt-1" />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>{t('public_page.phone_required')}</Label>
            <Switch checked={toggles.phone_required} onCheckedChange={v => setToggles(t => ({ ...t, phone_required: v }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>{t('public_page.email_required')}</Label>
            <Switch checked={toggles.email_required} onCheckedChange={v => setToggles(t => ({ ...t, email_required: v }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Apple Wallet activé</Label>
            <Switch checked={toggles.apple_wallet_enabled} onCheckedChange={v => setToggles(t => ({ ...t, apple_wallet_enabled: v }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Google Wallet activé</Label>
            <Switch checked={toggles.google_wallet_enabled} onCheckedChange={v => setToggles(t => ({ ...t, google_wallet_enabled: v }))} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
