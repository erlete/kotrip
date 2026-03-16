import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import LoaderSVG from '@/components/ui/loaders/loader-svg';
import { appConfig } from '@/config';
import { AuthProvider } from '@/features/auth';
import { DocumentLang } from '@/features/i18n/components/document-lang';
import { ThemeProvider } from '@/features/theme';
import clsx from 'clsx';
import { NextIntlClientProvider } from 'next-intl';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appConfig.brand.title,
  description: appConfig.brand.description,
  icons: {
    icon: appConfig.brand.favicon,
  },
};

type Props = {
  children: React.ReactNode;
};

/**
 * Layout raiz de la aplicacion Next.js.
 *
 * Envuelve toda la aplicacion con los providers de autenticacion, tema
 * e internacionalizacion, junto con las fuentes tipograficas y el Toaster
 * de notificaciones.
 */
export default function RootLayout({ children }: Props) {
  return (
    <html lang={appConfig.i18n.defaultLanguage}>
      <body
        className={clsx(
          'min-h-dvh flex flex-col',
          geistMono.variable,
          geistSans.variable,
        )}
      >
        <Toaster
          position={'bottom-right'}
          richColors
        />
        <Suspense
          fallback={
            <div className="min-h-dvh flex flex-col items-center justify-center">
              <LoaderSVG />
            </div>
          }
        >
          <AuthProvider>
            <ThemeProvider>
              <NextIntlClientProvider>
                <DocumentLang />
                {children}
              </NextIntlClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
