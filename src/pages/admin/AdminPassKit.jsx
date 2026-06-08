import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, AlertTriangle, CheckCircle2, Bell, FileText, Wifi, Play, AlertCircle } from 'lucide-react';
import { mockPasskitLogs, mockPasskitTemplates, mockMerchants, mockCustomers } from '@/data/mockData';
import { toast } from 'sonner';

export default function AdminPassKit() {
  const { t } = useLanguage();
  const [syncResult, setSyncResult] = useState(null);

  const handleSync = () => {
    setSyncResult({ success: true, data: { cardId: 'pk-' + Date.now(), serialNumber: 'APL-MOCK-001', status: 'created' } });
    toast.success(t('common.action_success'));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('passkit.title')} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('passkit.overview')}</TabsTrigger>
          <TabsTrigger value="templates">{t('passkit.templates')}</TabsTrigger>
          {/* <TabsTrigger value="logs">{t('passkit.logs')}</TabsTrigger>
          <TabsTrigger value="sync">{t('passkit.card_sync')}</TabsTrigger>
          <TabsTrigger value="api">{t('passkit.api_settings')}</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-sm font-medium">{t('passkit.status')}</p><p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('passkit.connected')} — Sandbox</p></div>
          </Card>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={t('passkit.active_cards')} value="756" icon={CreditCard} color="blue" />
            <StatCard title={t('passkit.failed_updates')} value="3" icon={AlertTriangle} color="red" />
            <StatCard title={t('passkit.notif_sent')} value="12" icon={Bell} color="green" />
            <StatCard title={t('passkit.template_count')} value="5" icon={FileText} color="purple" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success('Connexion OK')}>{t('passkit.test_connection')}</Button>
            <Button variant="outline" size="sm" onClick={() => toast.success(t('common.action_success'))}>{t('passkit.sync_templates')}</Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('passkit.template_name')}</TableHead><TableHead>{t('passkit.template_type')}</TableHead><TableHead>{t('passkit.template_merchant')}</TableHead><TableHead>{t('passkit.template_status')}</TableHead><TableHead className="hidden sm:table-cell">{t('passkit.template_synced')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mockPasskitTemplates.map(tmpl => (
                  <TableRow key={tmpl.id}>
                    <TableCell className="font-medium">{tmpl.name}</TableCell>
                    <TableCell><StatusBadge status={tmpl.type === 'apple_wallet' ? 'active' : 'synced'} label={tmpl.type === 'apple_wallet' ? 'Apple' : 'Google'} /></TableCell>
                    <TableCell>{tmpl.merchant}</TableCell>
                    <TableCell><StatusBadge status={tmpl.status === 'active' ? 'active' : 'error'} label={t(`common.${tmpl.status === 'active' ? 'active' : 'failed'}`)} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{tmpl.lastSynced}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('passkit.log_operation')}</TableHead><TableHead>{t('passkit.log_merchant')}</TableHead><TableHead className="hidden sm:table-cell">{t('passkit.log_customer')}</TableHead><TableHead>{t('passkit.log_status')}</TableHead><TableHead className="hidden md:table-cell">{t('passkit.log_message')}</TableHead><TableHead>{t('passkit.log_date')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mockPasskitLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.operation}</TableCell><TableCell>{log.merchant}</TableCell><TableCell className="hidden sm:table-cell">{log.customer}</TableCell>
                    <TableCell><StatusBadge status={log.status} label={t(`common.${log.status}`)} /></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{log.message}</TableCell><TableCell className="text-muted-foreground">{log.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">{t('passkit.card_sync')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>{t('passkit.sync_merchant')}</Label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>{mockMerchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t('passkit.sync_customer')}</Label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>{mockCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t('passkit.sync_action')}</Label>
                  <Select defaultValue="create"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create">{t('passkit.sync_create')}</SelectItem>
                      <SelectItem value="update">{t('passkit.sync_update')}</SelectItem>
                      <SelectItem value="push">{t('passkit.sync_push')}</SelectItem>
                      <SelectItem value="notify">{t('passkit.sync_notify')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gap-2" onClick={handleSync}><Play className="h-4 w-4" />{t('passkit.sync_execute')}</Button>
              </CardContent>
            </Card>
            {syncResult && (
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-sm">{t('passkit.sync_result')}</CardTitle></CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto">{JSON.stringify(syncResult, null, 2)}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <Card className="border-0 shadow-sm max-w-lg">
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">{t('passkit.api_warning')}</p>
              </div>
              <div><Label>{t('passkit.api_key')}</Label><Input defaultValue="pk_sandbox_••••••••••••" className="mt-1 font-mono" readOnly /></div>
              <div><Label>{t('passkit.environment')}</Label>
                <Select defaultValue="sandbox"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sandbox">{t('passkit.sandbox')}</SelectItem><SelectItem value="production">{t('passkit.production')}</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t('passkit.webhook_url')}</Label><Input defaultValue="https://api.fidelitypro.fr/webhooks/passkit" className="mt-1 font-mono text-xs" readOnly /></div>
              <div><Label>{t('passkit.apple_template')}</Label><Input defaultValue="tpl_apple_default_001" className="mt-1 font-mono text-xs" /></div>
              <div><Label>{t('passkit.google_template')}</Label><Input defaultValue="tpl_google_default_001" className="mt-1 font-mono text-xs" /></div>
              <Button onClick={() => toast.success(t('settings_page.saved'))}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}