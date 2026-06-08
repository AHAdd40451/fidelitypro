import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LanguageSwitcher from '@/components/ui-custom/LanguageSwitcher';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';
import { Star, Smartphone, Palette, Bell, BarChart3, QrCode, Gift, Check, ChevronDown, ChevronUp, ArrowRight, Menu, X } from 'lucide-react';

function Navbar() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Star className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-bold text-lg">FidélityPro</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">{t('nav.features')}</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">{t('nav.pricing')}</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">{t('nav.faq')}</a>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/connexion"><Button variant="ghost" size="sm">{t('nav.login')}</Button></Link>
          <Link to="/inscription"><Button size="sm">{t('nav.start')}</Button></Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2"><Menu className="h-5 w-5" /></button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <a href="#features" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.features')}</a>
          <a href="#pricing" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.pricing')}</a>
          <a href="#faq" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.faq')}</a>
          <div className="flex gap-2 pt-2"><LanguageSwitcher /><ThemeToggle /></div>
          <div className="flex gap-2">
            <Link to="/connexion" className="flex-1"><Button variant="outline" className="w-full" size="sm">{t('nav.login')}</Button></Link>
            <Link to="/inscription" className="flex-1"><Button className="w-full" size="sm">{t('nav.start')}</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}

export default function Landing() {
  const { t } = useLanguage();
  const features = [
    { icon: Smartphone, title: t('landing.feat_wallet'), desc: t('landing.feat_wallet_desc') },
    { icon: Palette, title: t('landing.feat_design'), desc: t('landing.feat_design_desc') },
    { icon: Bell, title: t('landing.feat_notif'), desc: t('landing.feat_notif_desc') },
    { icon: BarChart3, title: t('landing.feat_stats'), desc: t('landing.feat_stats_desc') },
    { icon: QrCode, title: t('landing.feat_qr'), desc: t('landing.feat_qr_desc') },
    { icon: Gift, title: t('landing.feat_offers'), desc: t('landing.feat_offers_desc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Star className="h-3 w-3" /> Apple Wallet & Google Wallet
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">{t('landing.hero_title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t('landing.hero_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/inscription"><Button size="lg" className="gap-2 px-8">{t('landing.hero_cta')} <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/rejoindre/cafe-le-central"><Button variant="outline" size="lg" className="px-8">{t('landing.hero_demo')}</Button></Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.how_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('landing.how_step1_title'), desc: t('landing.how_step1_desc'), icon: Palette },
              { step: '2', title: t('landing.how_step2_title'), desc: t('landing.how_step2_desc'), icon: QrCode },
              { step: '3', title: t('landing.how_step3_title'), desc: t('landing.how_step3_desc'), icon: Gift },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">ÉTAPE {s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.features_title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.benefits_title')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{t(`landing.benefit${i}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.pricing_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: t('landing.pricing_free'), price: t('landing.pricing_free_price'), features: ['pricing_free_f1','pricing_free_f2','pricing_free_f3','pricing_free_f4'], popular: false },
              { name: t('landing.pricing_pro'), price: t('landing.pricing_pro_price'), features: ['pricing_pro_f1','pricing_pro_f2','pricing_pro_f3','pricing_pro_f4','pricing_pro_f5'], popular: true },
              { name: t('landing.pricing_enterprise'), price: t('landing.pricing_enterprise_price'), features: ['pricing_enterprise_f1','pricing_enterprise_f2','pricing_enterprise_f3','pricing_enterprise_f4'], popular: false },
            ].map((plan, i) => (
              <Card key={i} className={`p-6 border ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary relative' : 'border-border shadow-sm'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Populaire</div>}
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {t(`landing.${f}`)}
                    </li>
                  ))}
                </ul>
                <Link to="/inscription"><Button variant={plan.popular ? 'default' : 'outline'} className="w-full">{t('nav.start')}</Button></Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.faq_title')}</h2>
          <div>
            {[1,2,3,4].map(i => <FAQ key={i} q={t(`landing.faq${i}_q`)} a={t(`landing.faq${i}_a`)} />)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <span className="font-semibold">FidélityPro</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 FidélityPro. {t('landing.footer_rights')}.</p>
        </div>
      </footer>
    </div>
  );
}