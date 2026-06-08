import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SuperadminRoles() {
  const { t } = useLanguage();
  const roles = ['Superadmin', 'Admin', 'Support', t('auth.merchant')];
  const permissions = [
    { key: 'view_merchants', label: t('superadmin.view_merchants') },
    { key: 'edit_merchants', label: t('superadmin.edit_merchants') },
    { key: 'suspend_merchants', label: t('superadmin.suspend_merchants') },
    { key: 'manage_passkit', label: t('superadmin.manage_passkit') },
    { key: 'manage_subs', label: t('superadmin.manage_subs') },
    { key: 'send_notif', label: t('superadmin.send_notif') },
    { key: 'view_audit', label: t('superadmin.view_audit') },
  ];

  const matrix = {
    Superadmin: permissions.map(() => true),
    Admin: [true, true, true, true, true, true, true],
    Support: [true, false, false, false, false, false, false],
    [t('auth.merchant')]: [false, false, false, false, false, true, false],
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('superadmin.roles_title')} />
      <Card className="border-0 shadow-sm overflow-x-auto">
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-medium text-muted-foreground">{t('superadmin.permission')}</th>
                {roles.map(r => <th key={r} className="text-center px-4 py-3 font-medium">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, i) => (
                <tr key={perm.key} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">{perm.label}</td>
                  {roles.map(r => (
                    <td key={r} className="text-center px-4 py-3">
                      <Checkbox defaultChecked={matrix[r]?.[i]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4"><Button onClick={() => toast.success(t('settings_page.saved'))}>{t('common.save')}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}