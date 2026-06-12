import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { signupMerchant } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Upload, Loader2 } from 'lucide-react';
import LanguageSwitcher from '@/components/ui-custom/LanguageSwitcher';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';
import { toast } from 'sonner';

export default function SignupPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
    businessType: '', mainColor: '#4f46e5', textColor: '#ffffff', welcomeMsg: '',
  });

  const slug = form.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      await signupMerchant({
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        ownerName: form.ownerName,
        phone: form.phone,
        businessType: form.businessType,
        bgColor: form.mainColor,
        textColor: form.textColor,
        accentColor: '#f0c040',
        welcomeMsg: form.welcomeMsg || `Bienvenue chez ${form.businessName} !`,
      });
      toast.success('Compte créé ! Vérifiez votre email pour confirmer.');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <div className="absolute top-4 right-4 flex gap-2"><LanguageSwitcher /><ThemeToggle /></div>
      <Card className="w-full max-w-lg p-8 border-0 shadow-lg my-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">{t('auth.signup')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.signup_subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('auth.business_name')}</Label><Input value={form.businessName} onChange={e => update('businessName', e.target.value)} className="mt-1" required /></div>
            <div><Label>{t('auth.owner_name')}</Label><Input value={form.ownerName} onChange={e => update('ownerName', e.target.value)} className="mt-1" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('auth.email')}</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="mt-1" required /></div>
            <div><Label>{t('auth.phone')}</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1" /></div>
          </div>
          <div>
            <Label>{t('auth.business_type')}</Label>
            <Select value={form.businessType} onValueChange={v => update('businessType', v)}>
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
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('auth.password')}</Label><Input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="mt-1" required minLength={8} /></div>
            <div><Label>{t('auth.confirm_password')}</Label><Input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="mt-1" required minLength={8} /></div>
          </div>
          <div>
            <Label>{t('auth.logo')}</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition">
              <Upload className="h-4 w-4" /> Drag & drop (optionnel)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('auth.main_color')}</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={form.mainColor} onChange={e => update('mainColor', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input value={form.mainColor} onChange={e => update('mainColor', e.target.value)} className="flex-1 h-8 text-xs" />
              </div>
            </div>
            <div>
              <Label>{t('auth.text_color')}</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={form.textColor} onChange={e => update('textColor', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input value={form.textColor} onChange={e => update('textColor', e.target.value)} className="flex-1 h-8 text-xs" />
              </div>
            </div>
          </div>
          <div>
            <Label>{t('auth.welcome_msg')}</Label>
            <Input value={form.welcomeMsg} onChange={e => update('welcomeMsg', e.target.value)} className="mt-1" placeholder={`Bienvenue chez ${form.businessName || '...'}!`} />
          </div>
          {slug && (
            <div className="text-xs text-muted-foreground p-2 rounded bg-muted">
              {t('auth.slug_preview')}: <span className="font-mono text-primary">fidelitypro.fr/rejoindre/{slug}</span>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('auth.signup_btn')}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('auth.have_account')}{' '}
          <Link to="/connexion" className="text-primary hover:underline">{t('auth.login_link')}</Link>
        </p>
      </Card>
    </div>
  );
}
