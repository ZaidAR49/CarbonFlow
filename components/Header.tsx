'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const t = useTranslations('header');
  const lt = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Replace the current locale segment in the path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="relative z-10 w-full px-4 sm:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            {/* Icon */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.4)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M8 12s1.5-2 4-2 4 2 4 2" />
                  <path d="M12 16v-4" />
                  <circle cx="12" cy="8" r="1" fill="white" />
                </svg>
              </div>
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  border: '1px solid rgba(16,185,129,0.4)',
                  animation: 'pulseRing 2s ease-out infinite',
                }}
              />
            </div>

            {/* Text */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
                <span className="text-white">{t('title')}</span>
                <span className="neon-text"> {t('titleAccent')}</span>
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-tight hidden sm:block">
                {t('subtitle')}
              </p>
            </div>
          </motion.div>

          {/* Right side: tag + lang switcher */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            {/* AI Powered tag — desktop only */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#34D399',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
              />
              {t('tagline')}
            </div>

            {/* Language switcher */}
            <button
              onClick={switchLocale}
              id="language-switcher"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#94A3B8',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.5)';
                (e.currentTarget as HTMLButtonElement).style.color = '#10B981';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.2)';
                (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {locale === 'en' ? lt('ar') : lt('en')}
            </button>
          </motion.div>
        </div>

        {/* Divider */}
        <div
          className="mt-4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)',
          }}
        />
      </div>
    </header>
  );
}
