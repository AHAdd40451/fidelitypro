import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe mis à jour');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.message || 'Échec de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <Card className="w-full max-w-sm p-8 border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground mt-1">Choisissez votre nouveau mot de passe</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1"
              required
              minLength={8}
            />
          </div>
          <div>
            <Label>Confirmer le mot de passe</Label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="mt-1"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</>
              : 'Réinitialiser le mot de passe'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
