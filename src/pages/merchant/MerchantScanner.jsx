import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QrCode, Camera, Search, CheckCircle2, User } from 'lucide-react';
import { mockCustomers } from '@/data/mockData';
import { toast } from 'sonner';

export default function MerchantScanner() {
  const { t } = useLanguage();
  const [token, setToken] = useState('');
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [visitMode, setVisitMode] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = () => {
    const found = mockCustomers.find(c => c.qrToken === token || c.name.toLowerCase().includes(token.toLowerCase()));
    setCustomer(found || mockCustomers[0]);
    setSuccess(false);
  };

  const handleAddPoints = () => {
    setSuccess(true);
    toast.success(t('scanner.success'));
  };

  const calculatedPoints = visitMode ? 10 : Math.round(parseFloat(amount || '0'));

  return (
    <div className="space-y-6">
      <PageHeader title={t('scanner.title')} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner area */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('scanner.title')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square max-w-[300px] mx-auto rounded-2xl bg-muted flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border">
              <Camera className="h-12 w-12 text-muted-foreground" />
              <Button variant="outline" size="sm" className="gap-2"><QrCode className="h-4 w-4" />{t('scanner.scan_btn')}</Button>
            </div>
            <div className="relative">
              <p className="text-xs text-muted-foreground mb-2">{t('scanner.manual_input')}</p>
              <div className="flex gap-2">
                <Input placeholder={t('scanner.placeholder')} value={token} onChange={e => setToken(e.target.value)} />
                <Button onClick={handleSearch} className="gap-2 shrink-0"><Search className="h-4 w-4" />{t('scanner.search_btn')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer card */}
        {customer && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">{t('scanner.customer_found')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 text-center">
                  <p className="text-xs text-muted-foreground">{t('scanner.current_points')}</p>
                  <p className="text-2xl font-bold text-primary">{customer.points}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground">{t('scanner.last_visit')}</p>
                  <p className="text-sm font-medium mt-1">{customer.lastVisit}</p>
                </div>
              </div>

              {success ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">{t('scanner.success')}</p>
                  <p className="text-xs text-muted-foreground">{t('scanner.card_updated')}</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{t('scanner.add_points')}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t('scanner.mode_amount')}</span>
                      <Switch checked={visitMode} onCheckedChange={setVisitMode} />
                      <span className="text-xs text-muted-foreground">{t('scanner.mode_visit')}</span>
                    </div>
                  </div>
                  {!visitMode && (
                    <div>
                      <Label className="text-xs">{t('scanner.order_amount')} (€)</Label>
                      <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" placeholder="0.00" />
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted flex justify-between items-center">
                    <span className="text-sm">{t('scanner.calculated_points')}</span>
                    <span className="text-lg font-bold text-primary">+{calculatedPoints}</span>
                  </div>
                  <Button onClick={handleAddPoints} className="w-full">{t('scanner.add_btn')}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}