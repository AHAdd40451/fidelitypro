import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAuditLogs } from '@/data/mockData';

export default function SuperadminAuditLogs() {
  const { t } = useLanguage();
  const [roleFilter, setRoleFilter] = useState('all');
  const filtered = roleFilter === 'all' ? mockAuditLogs : mockAuditLogs.filter(l => l.role === roleFilter);

  return (
    <div className="space-y-6">
      <PageHeader title={t('superadmin.audit_title')} />
      <div className="flex gap-3">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('superadmin.audit_role')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('clients.filter_all')}</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t('superadmin.audit_user')}</TableHead><TableHead>{t('superadmin.audit_role')}</TableHead><TableHead>{t('superadmin.audit_action')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('superadmin.audit_target')}</TableHead><TableHead className="hidden md:table-cell">{t('superadmin.audit_ip')}</TableHead>
            <TableHead>{t('superadmin.audit_status')}</TableHead><TableHead className="hidden lg:table-cell">{t('superadmin.audit_date')}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map(log => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.user}</TableCell><TableCell className="capitalize">{log.role}</TableCell><TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell className="hidden sm:table-cell">{log.target}</TableCell><TableCell className="hidden md:table-cell font-mono text-xs">{log.ip}</TableCell>
                <TableCell><StatusBadge status={log.status} label={t(`common.${log.status}`)} /></TableCell><TableCell className="hidden lg:table-cell text-muted-foreground">{log.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}