import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Shield, Star, QrCode } from 'lucide-react';
import { mockMerchants } from '@/data/mockData';

export default function CustomerJoin() {
  const { merchantSlug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState(null);
  const [form, setForm] = useState({ firstname: '', phone: '', email: '', consent: false });

  useEffect(() => {
    const found = mockMerchants.find(m => m.slug === merchantSlug);
    setMerchant(found || mockMerchants[0]);
  }, [merchantSlug]);

  if (!merchant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/rejoindre/${merchantSlug}/succes`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${merchant.bgColor}22, ${merchant.accentColor}22)` }}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: merchant.bgColor }}>
            <Star className="h-7 w-7" style={{ color: merchant.accentColor }} />
          </div>
          <h1 className="text-2xl font-bold">{t('join.welcome')} {merchant.name}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t('join.subtitle')}</p>
        </div>

        {/* Card Preview */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="p-4 flex items-center gap-3" style={{ backgroundColor: merchant.bgColor }}>
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Star className="h-5 w-5" style={{ color: merchant.accentColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: merchant.textColor }}>{merchant.name}</p>
              <p className="text-xs opacity-70" style={{ color: merchant.textColor }}>{t('join.preview')}</p>
            </div>
            <div className="ml-auto bg-white/20 rounded-lg p-2">
              <QrCode className="h-6 w-6" style={{ color: merchant.textColor }} />
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('join.firstname')}</Label>
              <Input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} required className="mt-1" />
            </div>
            <div>
              <Label>{t('join.phone')}</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" required className="mt-1" />
            </div>
            <div>
              <Label>{t('join.email')}</Label>
              <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="mt-1" />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox checked={form.consent} onCheckedChange={v => setForm({...form, consent: v})} id="consent" />
              <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight">{t('join.consent')}</label>
            </div>
            <div className="space-y-2 pt-2">
              <Button type="submit" className="w-full" style={{ backgroundColor: merchant.bgColor, color: merchant.textColor }}>
                {t('join.add_apple')}
              </Button>
              <Button type="submit" variant="outline" className="w-full">
                {t('join.add_google')}
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          {t('join.trust')}
        </div>
      </div>
    </div>
  );
}