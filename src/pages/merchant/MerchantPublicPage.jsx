import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPublicPage() {
  const { t } = useLanguage();
  const link = 'fidelitypro.fr/rejoindre/cafe-le-central';

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
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('/rejoindre/cafe-le-central', '_blank')}><ExternalLink className="h-4 w-4" />{t('public_page.preview_page')}</Button>
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
          <div><Label>{t('public_page.slug')}</Label><Input defaultValue="cafe-le-central" className="mt-1 font-mono" /></div>
          <div><Label>{t('public_page.welcome_msg')}</Label><Input defaultValue="Bienvenue au Café Le Central !" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">{t('public_page.main_color')}</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" defaultValue="#1e3a5f" className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input defaultValue="#1e3a5f" className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t('public_page.accent_color')}</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" defaultValue="#f0c040" className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input defaultValue="#f0c040" className="h-8 text-xs" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>{t('public_page.phone_required')}</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>{t('public_page.email_required')}</Label>
            <Switch />
          </div>
          <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('common.save')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}