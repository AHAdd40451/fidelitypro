import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });

  const handleSubmit = (e) => { e.preventDefault(); navigate('/connexion'); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <Card className="w-full max-w-sm p-8 border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3"><Star className="h-5 w-5 text-primary-foreground" /></div>
          <h1 className="text-xl font-bold">{t('auth.reset_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.reset_subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('auth.new_password')}</Label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1" required /></div>
          <div><Label>{t('auth.confirm_password')}</Label><Input type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} className="mt-1" required /></div>
          <Button type="submit" className="w-full">{t('auth.reset_btn')}</Button>
        </form>
      </Card>
    </div>
  );
}