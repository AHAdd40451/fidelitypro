import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getPasskitConfig } from '@/services/adminService';
import { testConnection, getTemplates, getOperationLogs } from '@/services/passkitService';
import PageHeader from '@/components/ui-custom/PageHeader';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, AlertTriangle, Bell, FileText, Wifi, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPassKit() {
  const { t } = useLanguage();
  const [config, setConfig] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    getPasskitConfig().catch(() => null).then(setConfig);
  }, []);

  const loadTemplates = () => {
    if (templates.length > 0) return;
    setLoadingTemplates(true);
    getTemplates()
      .then(setTemplates)
      .catch(() => toast.error('Erreur lors du chargement des templates'))
      .finally(() => setLoadingTemplates(false));
  };

  const loadLogs = () => {
    if (logs.length > 0) return;
    setLoadingLogs(true);
    getOperationLogs()
      .then(setLogs)
      .catch(() => toast.error('Erreur lors du chargement des logs'))
      .finally(() => setLoadingLogs(false));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection();
      setTestResult(result);
      toast.success(result.connected ? 'Connexion OK' : 'Connexion échouée');
    } catch (err) {
      toast.error(err.message || 'Erreur lors du test');
    } finally {
      setTesting(false);
    }
  };

  const isConnected = config?.status === 'active';

  return (
    <div className="space-y-6">
      <PageHeader title={t('passkit.title')} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('passkit.overview')}</TabsTrigger>
          <TabsTrigger value="templates" onClick={loadTemplates}>{t('passkit.templates')}</TabsTrigger>
          <TabsTrigger value="logs" onClick={loadLogs}>{t('passkit.logs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              <Wifi className={`h-5 w-5 ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{t('passkit.status')}</p>
              <p className={`text-xs font-medium ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isConnected
                  ? `${t('passkit.connected')} — ${config?.environment ?? 'Sandbox'}`
                  : config ? 'Non configuré' : 'Chargement...'}
              </p>
            </div>
          </Card>

          {testResult && (
            <Card className="border-0 shadow-sm p-4 bg-muted">
              <p className="text-sm font-mono">{JSON.stringify(testResult, null, 2)}</p>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('passkit.test_connection')}
            </Button>
          </div>

          {config && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">{t('passkit.api_settings')}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-40">{t('passkit.environment')}:</span>
                  <span className="capitalize">{config.environment ?? '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-40">Apple template:</span>
                  <span className="font-mono text-xs">{config.apple_template_id ?? '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-40">Google template:</span>
                  <span className="font-mono text-xs">{config.google_template_id ?? '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-40">Webhook URL:</span>
                  <span className="font-mono text-xs">{config.webhook_url ?? '—'}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            {loadingTemplates ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun template synchronisé</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('passkit.template_name')}</TableHead>
                  <TableHead>{t('passkit.template_type')}</TableHead>
                  <TableHead>{t('passkit.template_merchant')}</TableHead>
                  <TableHead>{t('passkit.template_status')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('passkit.template_synced')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {templates.map(tmpl => (
                    <TableRow key={tmpl.id}>
                      <TableCell className="font-medium">{tmpl.name}</TableCell>
                      <TableCell><StatusBadge status={tmpl.type === 'apple' ? 'active' : 'synced'} label={tmpl.type === 'apple' ? 'Apple' : 'Google'} /></TableCell>
                      <TableCell>{tmpl.merchant ?? '—'}</TableCell>
                      <TableCell><StatusBadge status={tmpl.status === 'synced' ? 'active' : 'error'} label={tmpl.status ?? '—'} /></TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {tmpl.lastSynced ? new Date(tmpl.lastSynced).toLocaleDateString('fr-FR') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            {loadingLogs ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun log d'opération</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('passkit.log_operation')}</TableHead>
                  <TableHead>{t('passkit.log_status')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('passkit.log_message')}</TableHead>
                  <TableHead>{t('passkit.log_date')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.operation_type}</TableCell>
                      <TableCell><StatusBadge status={log.status} label={log.status} /></TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{log.error_message ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(log.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
