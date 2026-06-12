import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QrCode, Camera, Search, CheckCircle2, User, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantScanner() {
  const { t } = useLanguage();
  const { merchantId } = useAuth();
  const [token, setToken] = useState('');
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [visitMode, setVisitMode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState(null); // { success, points_added, new_balance, wallet_synced, wallet_sync_failed }

  const handleSearch = async () => {
    if (!token.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('qr_code_token', token.trim())
        .eq('merchant_id', merchantId)
        .single();
      if (error || !data) throw new Error('Client introuvable');
      setCustomer(data);
    } catch {
      toast.error('Client introuvable pour ce QR code');
    } finally {
      setSearching(false);
    }
  };

  const handleAddPoints = async () => {
    if (!customer) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-points-and-sync-card', {
        body: {
          customer_id: customer.id,
          amount_paid: visitMode ? undefined : parseFloat(amount || '0'),
          mode: visitMode ? 'fixed_visit' : 'amount_based',
        },
      });
      if (error) throw error;
      setResult(data);
      setCustomer(prev => prev ? { ...prev, points_balance: data.new_balance } : prev);
      toast.success(t('scanner.success'));
      if (data.wallet_sync_failed) {
        toast.warning('Points sauvegardés mais synchronisation wallet échouée — réessayez plus tard');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout des points');
    } finally {
      setAdding(false);
    }
  };

  const calculatedPoints = visitMode ? '?' : Math.round(parseFloat(amount || '0'));

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
              <Button variant="outline" size="sm" className="gap-2">
                <QrCode className="h-4 w-4" />{t('scanner.scan_btn')}
              </Button>
            </div>
            <div className="relative">
              <p className="text-xs text-muted-foreground mb-2">{t('scanner.manual_input')}</p>
              <div className="flex gap-2">
                <Input
                  placeholder={t('scanner.placeholder')}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="gap-2 shrink-0" disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {t('scanner.search_btn')}
                </Button>
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
                  <p className="font-semibold">{customer.first_name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 text-center">
                  <p className="text-xs text-muted-foreground">{t('scanner.current_points')}</p>
                  <p className="text-2xl font-bold text-primary">{customer.points_balance}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground">{t('scanner.last_visit')}</p>
                  <p className="text-sm font-medium mt-1">
                    {customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString('fr-FR') : '—'}
                  </p>
                </div>
              </div>

              {result ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">{t('scanner.success')}</p>
                    <p className="text-sm font-medium">+{result.points_added} pts → {result.new_balance} pts</p>
                    {result.wallet_sync_failed && (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs justify-center">
                        <AlertTriangle className="h-3 w-3" />
                        Wallet non synchronisé — réessayez
                      </div>
                    )}
                    {result.wallet_synced && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('scanner.card_updated')}</p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setResult(null); setToken(''); setCustomer(null); setAmount(''); }}>
                    Scanner un autre client
                  </Button>
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
                      <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" placeholder="0.00" min="0" step="0.01" />
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted flex justify-between items-center">
                    <span className="text-sm">{t('scanner.calculated_points')}</span>
                    <span className="text-lg font-bold text-primary">+{calculatedPoints}</span>
                  </div>
                  <Button onClick={handleAddPoints} className="w-full" disabled={adding || (!visitMode && !amount)}>
                    {adding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('scanner.add_btn')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
