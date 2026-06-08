import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function MerchantSettings() {
  const { t } = useLanguage();
  const [pointsMode, setPointsMode] = useState('euro');

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings_page.title')} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.business_info')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.business_name')}</Label><Input defaultValue="Café Le Central" className="mt-1" /></div>
            <div><Label>{t('auth.owner_name')}</Label><Input defaultValue="Pierre Martin" className="mt-1" /></div>
            <div><Label>{t('auth.email')}</Label><Input defaultValue="pierre@cafecentral.fr" className="mt-1" /></div>
            <div><Label>{t('auth.phone')}</Label><Input defaultValue="01 23 45 67 89" className="mt-1" /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('settings_page.save')}</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.points_rules')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={pointsMode} onValueChange={setPointsMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="euro">{t('settings_page.points_per_euro')}</SelectItem>
                <SelectItem value="visit">{t('settings_page.points_per_visit')}</SelectItem>
              </SelectContent>
            </Select>
            {pointsMode === 'euro' ? (
              <div><Label>1€ = X {t('card_design.points')}</Label><Input type="number" defaultValue="1" className="mt-1" /></div>
            ) : (
              <div><Label>1 visite = X {t('card_design.points')}</Label><Input type="number" defaultValue="10" className="mt-1" /></div>
            )}
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('settings_page.save')}</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.password')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.password')}</Label><Input type="password" className="mt-1" /></div>
            <div><Label>{t('auth.new_password')}</Label><Input type="password" className="mt-1" /></div>
            <div><Label>{t('auth.confirm_password')}</Label><Input type="password" className="mt-1" /></div>
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('settings_page.save')}</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t('settings_page.language')}</Label>
              <Select defaultValue="fr"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>{t('settings_page.theme')}</Label>
              <Select defaultValue="light"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="light">{t('settings_page.light')}</SelectItem><SelectItem value="dark">{t('settings_page.dark')}</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('settings_page.save')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}