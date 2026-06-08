import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Star } from 'lucide-react';
import { mockMerchants } from '@/data/mockData';

export default function CustomerSuccess() {
  const { merchantSlug } = useParams();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    setMerchant(mockMerchants.find(m => m.slug === merchantSlug) || mockMerchants[0]);
  }, [merchantSlug]);

  if (!merchant) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${merchant.bgColor}22, ${merchant.accentColor}22)` }}>
      <Card className="w-full max-w-md p-8 border-0 shadow-lg text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('join.success_title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('join.success_subtitle')}</p>
        <div className="space-y-2">
          <Button className="w-full" style={{ backgroundColor: merchant.bgColor, color: merchant.textColor }}>
             {t('join.add_apple')}
          </Button>
          <Button variant="outline" className="w-full">
             {t('join.add_google')}
          </Button>
        </div>
        <Link to={`/rejoindre/${merchantSlug}`} className="inline-block mt-4 text-sm text-primary hover:underline">{t('join.back')}</Link>
      </Card>
    </div>
  );
}