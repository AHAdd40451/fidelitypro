import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import LanguageSwitcher from '@/components/ui-custom/LanguageSwitcher';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/merchant/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
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
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>{t('auth.password')}</Label>
              <Link to="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
                {t('auth.forgot')}
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</>
              : t('auth.login_btn')}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('auth.no_account')}{' '}
          <Link to="/inscription" className="text-primary hover:underline">{t('auth.signup_link')}</Link>
        </p>
      </Card>
    </div>
  );
}
