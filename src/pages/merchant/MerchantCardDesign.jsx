import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getCardDesign, updateCardDesign, pushCardDesignToPassKit } from '@/services/cardDesignService';
import { uploadCardAsset } from '@/services/storageService';
import PageHeader from '@/components/ui-custom/PageHeader';
import WalletCardPreview from '@/components/wallet/WalletCardPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Upload, Save, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_DESIGN = {
  background_color: '#1e3a5f',
  text_color: '#ffffff',
  accent_color: '#f0c040',
  merchant_name_on_card: '',
  card_title: 'Carte de fidélité',
  card_description: '',
  points_label: 'Points',
  qr_label: 'Scanner pour ajouter des points',
  logo_url: null,
};

export default function MerchantCardDesign() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [previewTab, setPreviewTab] = useState('apple');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!merchantId) return;
    getCardDesign(merchantId)
      .then(data => { if (data) setDesign(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [merchantId]);

  const update = (k, v) => setDesign(prev => ({ ...prev, [k]: v }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !merchantId) return;
    try {
      const url = await uploadCardAsset(merchantId, file, `logo.${file.name.split('.').pop()}`);
      update('logo_url', url);
      toast.success('Logo uploadé');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'upload');
    }
  };

  const handleSave = async () => {
    if (!merchantId) return;
    setSaving(true);
    try {
      await updateCardDesign(merchantId, design);
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePushPassKit = async () => {
    if (!merchantId) return;
    setPushing(true);
    try {
      await pushCardDesignToPassKit(merchantId, design);
      toast.success(t('card_design.push_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur PassKit');
    } finally {
      setPushing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('card_design.title')} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('card_design.title')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('card_design.logo')}</Label>
              <div
                className="mt-1 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {design.logo_url
                  ? <img src={design.logo_url} alt="Logo" className="h-12 object-contain" />
                  : <><Upload className="h-4 w-4" /> Upload</>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('card_design.merchant_name')}</Label>
                <Input value={design.merchant_name_on_card} onChange={e => update('merchant_name_on_card', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{t('card_design.card_title')}</Label>
                <Input value={design.card_title} onChange={e => update('card_title', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'background_color', label: t('card_design.bg_color') },
                { key: 'text_color', label: t('card_design.text_color') },
                { key: 'accent_color', label: t('card_design.accent_color') },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <div className="flex gap-1.5 items-center mt-1">
                    <input type="color" value={design[key] || '#000000'} onChange={e => update(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <Input value={design[key] || ''} onChange={e => update(key, e.target.value)} className="h-8 text-xs flex-1" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Label>{t('card_design.points_label')}</Label>
              <Input value={design.points_label} onChange={e => update('points_label', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t('card_design.welcome_msg')}</Label>
              <Input value={design.card_description || ''} onChange={e => update('card_description', e.target.value)} className="mt-1" />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('card_design.push_warning')}</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('card_design.save')}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handlePushPassKit} disabled={pushing}>
                {pushing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t('card_design.push_passkit')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm p-6">
            <h3 className="text-sm font-medium mb-4">{t('card_design.live_preview')}</h3>
            <Tabs value={previewTab} onValueChange={setPreviewTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="apple">{t('card_design.apple_preview')}</TabsTrigger>
                <TabsTrigger value="google">{t('card_design.google_preview')}</TabsTrigger>
              </TabsList>
              <TabsContent value="apple" className="flex justify-center">
                <WalletCardPreview
                  type="apple"
                  merchantName={design.merchant_name_on_card}
                  cardTitle={design.card_title}
                  bgColor={design.background_color}
                  textColor={design.text_color}
                  accentColor={design.accent_color}
                />
              </TabsContent>
              <TabsContent value="google" className="flex justify-center">
                <WalletCardPreview
                  type="google"
                  merchantName={design.merchant_name_on_card}
                  cardTitle={design.card_title}
                  bgColor={design.background_color}
                  textColor={design.text_color}
                  accentColor={design.accent_color}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
