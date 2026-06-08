import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import LanguageSwitcher from '@/components/ui-custom/LanguageSwitcher';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';

export default function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [role, setRole] = useState('merchant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === 'merchant') navigate('/merchant/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      // else navigate('/superadmin/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <div className="absolute top-4 right-4 flex gap-2"><LanguageSwitcher /><ThemeToggle /></div>
      <Card className="w-full max-w-sm p-8 border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">{t('auth.login')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.login_subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('auth.email')}</Label>
            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" required />
          </div>
          <div>
            <Label>{t('auth.password')}</Label>
            <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1" required />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={form.remember} onCheckedChange={v => setForm({...form, remember: v})} />
              <label htmlFor="remember" className="text-xs">{t('auth.remember')}</label>
            </div>
            <Link to="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">{t('auth.forgot')}</Link>
          </div>
          {/* Demo role selector */}
          <div className="p-3 rounded-lg bg-muted">
            <Label className="text-xs text-muted-foreground mb-1.5 block">{t('auth.role_demo')}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant">{t('auth.merchant')}</SelectItem>
                <SelectItem value="admin">{t('auth.admin')}</SelectItem>
                {/* <SelectItem value="superadmin">{t('auth.superadmin')}</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login_btn')}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('auth.no_account')} <Link to="/inscription" className="text-primary hover:underline">{t('auth.signup_link')}</Link>
        </p>
      </Card>
    </div>
  );
}