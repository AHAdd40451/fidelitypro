import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { getMyMerchant, updateMerchant } from '@/services/merchantService';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantSettings() {
  const { t } = useLanguage();
  const { profile, merchantId } = useAuth();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [businessForm, setBusinessForm] = useState({ name: '', owner_name: '', phone: '' });
  const [pointsMode, setPointsMode] = useState('amount_based');
  const [pointsValue, setPointsValue] = useState('1');
  const [pwdForm, setPwdForm] = useState({ new_password: '', confirm: '' });

  useEffect(() => {
    getMyMerchant()
      .then(m => {
        if (m) {
          setMerchant(m);
          setBusinessForm({ name: m.name ?? '', owner_name: m.owner_name ?? '', phone: m.phone ?? '' });
          setPointsMode(m.points_mode ?? 'amount_based');
          setPointsValue(String(m.points_mode === 'fixed_visit' ? (m.fixed_points_per_visit ?? 10) : (m.points_per_euro ?? 1)));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBusiness = async () => {
    if (!merchantId) return;
    setSaving(true);
    try {
      await updateMerchant(merchantId, {
        name: businessForm.name,
        owner_name: businessForm.owner_name,
        phone: businessForm.phone,
      });
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePoints = async () => {
    if (!merchantId) return;
    setSaving(true);
    try {
      const val = parseFloat(pointsValue) || 1;
      await updateMerchant(merchantId, {
        points_mode: pointsMode,
        points_per_euro: pointsMode === 'amount_based' ? val : null,
        fixed_points_per_visit: pointsMode === 'fixed_visit' ? val : null,
      });
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!pwdForm.new_password || pwdForm.new_password !== pwdForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.new_password });
      if (error) throw error;
      setPwdForm({ new_password: '', confirm: '' });
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings_page.title')} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.business_info')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.business_name')}</Label><Input value={businessForm.name} onChange={e => setBusinessForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>{t('auth.owner_name')}</Label><Input value={businessForm.owner_name} onChange={e => setBusinessForm(f => ({ ...f, owner_name: e.target.value }))} className="mt-1" /></div>
            <div><Label>{t('auth.email')}</Label><Input value={profile?.email ?? ''} readOnly className="mt-1 opacity-60" /></div>
            <div><Label>{t('auth.phone')}</Label><Input value={businessForm.phone} onChange={e => setBusinessForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
            <Button onClick={handleSaveBusiness} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('settings_page.save')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.points_rules')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={pointsMode} onValueChange={v => { setPointsMode(v); setPointsValue('1'); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amount_based">{t('settings_page.points_per_euro')}</SelectItem>
                <SelectItem value="fixed_visit">{t('settings_page.points_per_visit')}</SelectItem>
              </SelectContent>
            </Select>
            {pointsMode === 'amount_based' ? (
              <div><Label>1€ = X {t('card_design.points')}</Label><Input type="number" value={pointsValue} onChange={e => setPointsValue(e.target.value)} className="mt-1" /></div>
            ) : (
              <div><Label>1 visite = X {t('card_design.points')}</Label><Input type="number" value={pointsValue} onChange={e => setPointsValue(e.target.value)} className="mt-1" /></div>
            )}
            <Button onClick={handleSavePoints} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('settings_page.save')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.password')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.new_password')}</Label><Input type="password" value={pwdForm.new_password} onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))} className="mt-1" /></div>
            <div><Label>{t('auth.confirm_password')}</Label><Input type="password" value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} className="mt-1" /></div>
            <Button onClick={handleSavePassword} disabled={savingPwd}>
              {savingPwd ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('settings_page.save')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('settings_page.language')}</Label>
              <Select defaultValue="fr"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('settings_page.theme')}</Label>
              <Select defaultValue="light"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="light">{t('settings_page.light')}</SelectItem><SelectItem value="dark">{t('settings_page.dark')}</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
