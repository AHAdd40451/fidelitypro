import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Shield, Star, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerJoin() {
  const { merchantSlug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstname: '', phone: '', email: '', consent: false });

  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_merchant_by_slug', { p_slug: merchantSlug });
        if (error || !data || data.length === 0) throw new Error('Merchant not found');
        setMerchant(data[0]);
      } catch {
        toast.error('Programme de fidélité introuvable');
      } finally {
        setLoading(false);
      }
    };
    loadMerchant();
  }, [merchantSlug]);

  const handleSubmit = async (e, walletProvider) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error('Veuillez accepter les conditions');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('public-customer-signup', {
        body: {
          slug: merchantSlug,
          first_name: form.firstname,
          phone: form.phone,
          email: form.email || undefined,
          wallet_provider: walletProvider,
        },
      });
      if (error) throw error;
      if (data?.wallet_urls?.[walletProvider]) {
        window.location.href = data.wallet_urls[walletProvider];
      } else {
        navigate(`/rejoindre/${merchantSlug}/succes`);
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Programme introuvable</p>
          <p className="text-sm text-muted-foreground">Ce lien de fidélité n'existe pas ou n'est plus actif.</p>
        </div>
      </div>
    );
  }

  const bgColor = merchant.card_background_color || '#1e3a5f';
  const textColor = merchant.card_text_color || '#ffffff';
  const accentColor = merchant.accent_color || '#f0c040';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${bgColor}22, ${accentColor}22)` }}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: bgColor }}>
            {merchant.logo_url
              ? <img src={merchant.logo_url} alt={merchant.name} className="w-10 h-10 object-contain" />
              : <Star className="h-7 w-7" style={{ color: accentColor }} />}
          </div>
          <h1 className="text-2xl font-bold">{t('join.welcome')} {merchant.name}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t('join.subtitle')}</p>
        </div>

        {/* Card preview */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="p-4 flex items-center gap-3" style={{ backgroundColor: bgColor }}>
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Star className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: textColor }}>{merchant.name}</p>
              <p className="text-xs opacity-70" style={{ color: textColor }}>{t('join.preview')}</p>
            </div>
            <div className="ml-auto bg-white/20 rounded-lg p-2">
              <QrCode className="h-6 w-6" style={{ color: textColor }} />
            </div>
          </div>
        </Card>

        {/* Registration form */}
        <Card className="p-6 border-0 shadow-lg">
          <form className="space-y-4">
            <div>
              <Label>{t('join.firstname')}</Label>
              <Input value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>{t('join.phone')}</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" required className="mt-1" />
            </div>
            {merchant.email_required !== false && (
              <div>
                <Label>{t('join.email')}</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="mt-1" />
              </div>
            )}
            <div className="flex items-start gap-2">
              <Checkbox checked={form.consent} onCheckedChange={v => setForm({ ...form, consent: v })} id="consent" />
              <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight">{t('join.consent')}</label>
            </div>
            <div className="space-y-2 pt-2">
              {merchant.apple_wallet_enabled !== false && (
                <Button
                  type="button"
                  className="w-full"
                  style={{ backgroundColor: bgColor, color: textColor }}
                  disabled={submitting || !form.firstname || !form.phone}
                  onClick={(e) => handleSubmit(e, 'apple')}
                >
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t('join.add_apple')}
                </Button>
              )}
              {merchant.google_wallet_enabled !== false && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={submitting || !form.firstname || !form.phone}
                  onClick={(e) => handleSubmit(e, 'google')}
                >
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t('join.add_google')}
                </Button>
              )}
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
