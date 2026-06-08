import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function VerifyPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleSubmit = (e) => { e.preventDefault(); navigate('/merchant/dashboard'); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/30">
      <Card className="w-full max-w-sm p-8 border-0 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3"><Star className="h-5 w-5 text-primary-foreground" /></div>
          <h1 className="text-xl font-bold">{t('auth.verify_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.verify_subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('auth.code')}</Label><Input value={code} onChange={e => setCode(e.target.value)} className="mt-1 text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} required /></div>
          <Button type="submit" className="w-full">{t('auth.verify_btn')}</Button>
          <button type="button" className="w-full text-xs text-primary hover:underline">{t('auth.resend')}</button>
        </form>
      </Card>
    </div>
  );
}