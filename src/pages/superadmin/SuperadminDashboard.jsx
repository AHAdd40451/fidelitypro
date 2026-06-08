import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Store, CreditCard, Bell, Shield, Activity, CheckCircle2, Wifi } from 'lucide-react';
import { mockAuditLogs } from '@/data/mockData';

export default function SuperadminDashboard() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('superadmin.dashboard_title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('superadmin.total_admins')} value="3" icon={Shield} color="blue" />
        <StatCard title={t('superadmin.total_merchants')} value="5" icon={Store} color="green" />
        <StatCard title={t('superadmin.total_cards')} value="756" icon={CreditCard} color="purple" />
        <StatCard title={t('superadmin.total_notifications')} value="12" icon={Bell} color="orange" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div><p className="text-xs text-muted-foreground">{t('superadmin.system_health')}</p><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">OK</p></div>
        </Card>
        <Card className="border-0 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div><p className="text-xs text-muted-foreground">{t('superadmin.api_status')}</p><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Online</p></div>
        </Card>
        <Card className="border-0 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div><p className="text-xs text-muted-foreground">{t('superadmin.passkit_status')}</p><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Connected</p></div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm">{t('superadmin.recent_logs')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('superadmin.audit_user')}</TableHead><TableHead>{t('superadmin.audit_action')}</TableHead><TableHead className="hidden sm:table-cell">{t('superadmin.audit_target')}</TableHead><TableHead>{t('superadmin.audit_status')}</TableHead><TableHead className="hidden md:table-cell">{t('superadmin.audit_date')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {mockAuditLogs.slice(0, 5).map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell><TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell className="hidden sm:table-cell">{log.target}</TableCell><TableCell><StatusBadge status={log.status} label={t(`common.${log.status}`)} /></TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{log.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}