import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import WalletCardPreview from '@/components/wallet/WalletCardPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Upload, Save, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantCardDesign() {
  const { t } = useLanguage();
  const [design, setDesign] = useState({
    merchantName: 'Café Le Central', cardTitle: 'Carte de fidélité',
    bgColor: '#1e3a5f', textColor: '#ffffff', accentColor: '#f0c040',
    pointsLabel: 'Points', welcomeMsg: 'Bienvenue !',
    appleLabel: 'Ajouter à Apple Wallet', googleLabel: 'Ajouter à Google Wallet',
  });
  const [previewTab, setPreviewTab] = useState('apple');

  const update = (k, v) => setDesign(prev => ({ ...prev, [k]: v }));

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
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition">
                <Upload className="h-4 w-4" /> Upload
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('card_design.merchant_name')}</Label><Input value={design.merchantName} onChange={e => update('merchantName', e.target.value)} className="mt-1" /></div>
              <div><Label>{t('card_design.card_title')}</Label><Input value={design.cardTitle} onChange={e => update('cardTitle', e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t('card_design.bg_color')}</Label>
                <div className="flex gap-1.5 items-center mt-1">
                  <input type="color" value={design.bgColor} onChange={e => update('bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={design.bgColor} onChange={e => update('bgColor', e.target.value)} className="h-8 text-xs flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t('card_design.text_color')}</Label>
                <div className="flex gap-1.5 items-center mt-1">
                  <input type="color" value={design.textColor} onChange={e => update('textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={design.textColor} onChange={e => update('textColor', e.target.value)} className="h-8 text-xs flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t('card_design.accent_color')}</Label>
                <div className="flex gap-1.5 items-center mt-1">
                  <input type="color" value={design.accentColor} onChange={e => update('accentColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={design.accentColor} onChange={e => update('accentColor', e.target.value)} className="h-8 text-xs flex-1" />
                </div>
              </div>
            </div>
            <div><Label>{t('card_design.points_label')}</Label><Input value={design.pointsLabel} onChange={e => update('pointsLabel', e.target.value)} className="mt-1" /></div>
            <div><Label>{t('card_design.welcome_msg')}</Label><Input value={design.welcomeMsg} onChange={e => update('welcomeMsg', e.target.value)} className="mt-1" /></div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('card_design.push_warning')}</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={() => toast.success(t('settings_page.saved'))}><Save className="h-4 w-4" />{t('card_design.save')}</Button>
              <Button variant="outline" className="gap-2" onClick={() => toast.success(t('card_design.push_success'))}><Send className="h-4 w-4" />{t('card_design.push_passkit')}</Button>
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
                <WalletCardPreview type="apple" merchantName={design.merchantName} cardTitle={design.cardTitle} bgColor={design.bgColor} textColor={design.textColor} accentColor={design.accentColor} />
              </TabsContent>
              <TabsContent value="google" className="flex justify-center">
                <WalletCardPreview type="google" merchantName={design.merchantName} cardTitle={design.cardTitle} bgColor={design.bgColor} textColor={design.textColor} accentColor={design.accentColor} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}