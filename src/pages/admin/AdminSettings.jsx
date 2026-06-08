import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <PageHeader title={t('settings_page.title')} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm">{t('settings_page.profile')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('superadmin.name')}</Label><Input defaultValue="Admin Principal" className="mt-1" /></div>
            <div><Label>{t('auth.email')}</Label><Input defaultValue="admin@fidelitypro.fr" className="mt-1" /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))} size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm">{t('settings_page.password')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.password')}</Label><Input type="password" className="mt-1" /></div>
            <div><Label>{t('auth.new_password')}</Label><Input type="password" className="mt-1" /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))} size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm">{t('settings_page.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t('settings_page.language')}</Label>
              <Select defaultValue="fr"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>{t('settings_page.theme')}</Label>
              <Select defaultValue="light"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">{t('settings_page.light')}</SelectItem><SelectItem value="dark">{t('settings_page.dark')}</SelectItem></SelectContent></Select></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))} size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}