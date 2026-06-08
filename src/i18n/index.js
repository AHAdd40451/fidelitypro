import fr from './fr.json';
import en from './en.json';

const translations = { fr, en };

export function getTranslation(lang, key) {
  const keys = key.split('.');
  let result = translations[lang] || translations.fr;
  for (const k of keys) {
    result = result?.[k];
  }
  return result || key;
}

export default translations;