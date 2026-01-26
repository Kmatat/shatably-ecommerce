import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/locales/i18n';
import { useLanguageStore } from '@/lib/store';
import AuthModal from '@/components/AuthModal';
import CartSidebar from '@/components/CartSidebar';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { language, direction } = useLanguageStore();

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language, direction]);

  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
      <AuthModal />
      <CartSidebar />
    </I18nextProvider>
  );
}
