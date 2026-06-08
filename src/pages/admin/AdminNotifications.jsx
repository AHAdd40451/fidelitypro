import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send } from 'lucide-react';
import { mockNotifications, mockMerchants } from '@/data/mockData';
import { toast } from 'sonner';

export default function AdminNotifications() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications_page.title')} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('notifications_page.create')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('passkit.sync_merchant')}</Label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{mockMerchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('notifications_page.message_title')}</Label><Input className="mt-1" /></div>
            <div><Label>{t('notifications_page.message_body')}</Label><Textarea className="mt-1" rows={3} /></div>
            <div><Label>{t('notifications_page.target')}</Label>
              <Select defaultValue="all"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications_page.target_all')}</SelectItem>
                  <SelectItem value="points">{t('notifications_page.target_points')}</SelectItem>
                  <SelectItem value="inactive">{t('notifications_page.target_inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={() => toast.success(t('common.action_success'))}><Send className="h-4 w-4" />{t('notifications_page.send')}</Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('notifications_page.history')}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('notifications_page.message_title')}</TableHead><TableHead>{t('notifications_page.recipients')}</TableHead><TableHead>{t('notifications_page.status')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mockNotifications.map(n => (
                  <TableRow key={n.id}><TableCell className="font-medium">{n.title}</TableCell><TableCell>{n.recipients}</TableCell><TableCell><StatusBadge status={n.status} label={t(`notifications_page.${n.status}`)} /></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}