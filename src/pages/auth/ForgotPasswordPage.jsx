import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });
      if (error) throw error;
    } catch {
      // Always show success — don't reveal whether email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <Card className="w-full max-w-sm p-8 border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">{t('auth.forgot_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.forgot_subtitle')}</p>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <span className="text-xl">✉️</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Un email de réinitialisation a été envoyé si ce compte existe.
            </p>
            <Link to="/connexion">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />{t('auth.back_login')}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('auth.email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('auth.send_reset')}
            </Button>
            <Link to="/connexion" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline">
              <ArrowLeft className="h-3 w-3" />{t('auth.back_login')}
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
