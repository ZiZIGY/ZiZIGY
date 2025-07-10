import { createI18n } from 'vue-i18n';
import messages from '../locales';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'ru',
  fallbackLocale: 'ru',
  messages,
});

export default i18n;
