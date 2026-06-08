import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SuperadminSystemSettings() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <PageHeader title={t('superadmin.system_title')} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm">{t('superadmin.system_title')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('superadmin.platform_name')}</Label><Input defaultValue="FidélityPro" className="mt-1" /></div>
            <div className="flex items-center justify-between"><Label>{t('superadmin.default_lang')}</Label>
              <Select defaultValue="fr"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>{t('superadmin.default_theme')}</Label>
              <Select defaultValue="light"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">{t('settings_page.light')}</SelectItem><SelectItem value="dark">{t('settings_page.dark')}</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>{t('superadmin.maintenance')}</Label><Switch /></div>
            <div className="flex items-center justify-between"><Label>{t('superadmin.registration')}</Label><Switch defaultChecked /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('common.save')}</Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm">{t('superadmin.default_pricing')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Free plan - {t('clients.title')}</Label><Input defaultValue="50" type="number" className="mt-1" /></div>
            <div><Label>Pro plan - prix mensuel (€)</Label><Input defaultValue="29" type="number" className="mt-1" /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('common.save')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}