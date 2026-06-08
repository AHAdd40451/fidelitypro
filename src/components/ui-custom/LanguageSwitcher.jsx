import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { lang, switchLang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLang(lang === 'fr' ? 'en' : 'fr')}
      className="text-xs font-medium gap-1.5 px-2.5"
    >
      <span className="text-base leading-none">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      {lang === 'fr' ? 'FR' : 'EN'}
    </Button>
  );
}