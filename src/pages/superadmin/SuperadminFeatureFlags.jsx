import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SuperadminFeatureFlags() {
  const { t } = useLanguage();
  const flags = [
    { key: 'flag_apple', default: true },
    { key: 'flag_google', default: true },
    { key: 'flag_signup', default: true },
    { key: 'flag_notif', default: true },
    { key: 'flag_offers', default: true },
    { key: 'flag_dark', default: true },
    { key: 'flag_english', default: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('superadmin.flags_title')} />
      <Card className="border-0 shadow-sm max-w-lg">
        <CardContent className="pt-6 space-y-1">
          {flags.map(flag => (
            <div key={flag.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <Label className="text-sm">{t(`superadmin.${flag.key}`)}</Label>
              <Switch defaultChecked={flag.default} onCheckedChange={() => toast.success(t('common.action_success'))} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}