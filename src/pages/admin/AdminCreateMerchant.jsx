import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
}

function generateTempPassword() {
  return 'Tmp!' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AdminCreateMerchant() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    business_type: '',
    bg_color: '#4f46e5',
    text_color: '#ffffff',
    welcome_msg: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name || !form.email) return;
    setLoading(true);
    try {
      const tempPassword = generateTempPassword();
      const slug = generateSlug(form.business_name);

      // Create auth user — if email confirmation is required, the user is not auto-signed-in
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: tempPassword,
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Impossible de créer le compte utilisateur');

      // Create merchant record
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          name: form.business_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone || null,
          business_type: form.business_type || null,
          slug,
          card_background_color: form.bg_color,
          card_text_color: form.text_color,
          accent_color: '#f0c040',
          welcome_message: form.welcome_msg || null,
          status: 'active',
          points_mode: 'amount_based',
          points_per_euro: 1,
        })
        .select()
        .single();
      if (merchantError) throw merchantError;

      // Create profile
      await supabase.from('profiles').insert({
        id: userId,
        email: form.email,
        full_name: form.owner_name || form.business_name,
        role: 'merchant',
        merchant_id: merchant.id,
        status: 'active',
      });

      // Create merchant_settings
      await supabase.from('merchant_settings').insert({
        merchant_id: merchant.id,
        public_page_enabled: true,
        phone_required: true,
        email_required: false,
        apple_wallet_enabled: true,
        google_wallet_enabled: true,
      });

      // Create free subscription
      await supabase.from('subscriptions').insert({
        merchant_id: merchant.id,
        plan: 'free',
        status: 'free',
      });

      setCreated({ email: form.email, slug, tempPassword });
      toast.success(t('common.action_success'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="space-y-6 max-w-lg">
        <PageHeader title={t('admin.create_merchant')} action={<Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/merchants')}><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button>} />
        <Card className="border-0 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <h2 className="font-semibold">Commerce créé avec succès</h2>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-medium">Instructions pour le commerçant :</p>
                <p>Email : <span className="font-mono font-semibold">{created.email}</span></p>
                <p>Mot de passe temporaire : <span className="font-mono font-semibold">{created.tempPassword}</span></p>
                <p>Demandez au commerçant de se connecter à <span className="font-mono">/connexion</span> puis de changer son mot de passe dans les paramètres.</p>
                <p>Lien public : <span className="font-mono">/rejoindre/{created.slug}</span></p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/merchants')} variant="outline">{t('common.back')}</Button>
            <Button onClick={() => { setCreated(null); setForm({ business_name: '', owner_name: '', email: '', phone: '', business_type: '', bg_color: '#4f46e5', text_color: '#ffffff', welcome_msg: '' }); }}>
              Créer un autre
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.create_merchant')} action={<Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/merchants')}><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button>} />
      <Card className="border-0 shadow-sm max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('auth.business_name')}</Label><Input className="mt-1" required value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} /></div>
              <div><Label>{t('auth.owner_name')}</Label><Input className="mt-1" value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('auth.email')}</Label><Input type="email" className="mt-1" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>{t('auth.phone')}</Label><Input className="mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div>
              <Label>{t('auth.business_type')}</Label>
              <Select value={form.business_type} onValueChange={v => setForm(f => ({ ...f, business_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">{t('auth.type_restaurant')}</SelectItem>
                  <SelectItem value="cafe">{t('auth.type_cafe')}</SelectItem>
                  <SelectItem value="salon">{t('auth.type_salon')}</SelectItem>
                  <SelectItem value="boutique">{t('auth.type_boutique')}</SelectItem>
                  <SelectItem value="autre">{t('auth.type_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t('auth.welcome_msg')}</Label><Input className="mt-1" value={form.welcome_msg} onChange={e => setForm(f => ({ ...f, welcome_msg: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('auth.main_color')}</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="w-8 h-8 rounded border-0 cursor-pointer" />
                  <Input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label>{t('auth.text_color')}</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={form.text_color} onChange={e => setForm(f => ({ ...f, text_color: e.target.value }))} className="w-8 h-8 rounded border-0 cursor-pointer" />
                  <Input value={form.text_color} onChange={e => setForm(f => ({ ...f, text_color: e.target.value }))} className="h-8 text-xs" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">Un mot de passe temporaire sera généré automatiquement. Communiquez-le au commerçant pour qu'il puisse se connecter et le changer.</p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('admin.create_merchant')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
