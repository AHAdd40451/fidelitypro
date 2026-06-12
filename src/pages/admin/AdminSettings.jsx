import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ new_password: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success(t('settings_page.saved'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
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

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings_page.title')} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.profile')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.owner_name')}</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" /></div>
            <div><Label>{t('auth.email')}</Label><Input value={profile?.email ?? ''} readOnly className="mt-1 opacity-60" /></div>
            <Button onClick={handleSaveProfile} disabled={saving} size="sm">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.password')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t('auth.new_password')}</Label><Input type="password" value={pwdForm.new_password} onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))} className="mt-1" /></div>
            <div><Label>{t('auth.confirm_password')}</Label><Input type="password" value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} className="mt-1" /></div>
            <Button onClick={handleSavePassword} disabled={savingPwd} size="sm">
              {savingPwd ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">{t('settings_page.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('settings_page.language')}</Label>
              <Select defaultValue="fr">
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('settings_page.theme')}</Label>
              <Select defaultValue="light">
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings_page.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings_page.dark')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
