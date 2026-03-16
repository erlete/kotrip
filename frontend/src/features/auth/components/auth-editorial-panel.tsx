/**
 * @file auth-editorial-panel.tsx
 * @description
 * Panel editorial izquierdo para las paginas de autenticacion.
 * Muestra la identidad de marca, un mensaje de bienvenida
 * y estadisticas de la plataforma.
 */

import { getTranslations } from 'next-intl/server';

/**
 * Panel editorial decorativo para la zona izquierda del layout de autenticación.
 *
 * Incluye logotipo, titular estilizado con tipografía serif,
 * descripción de la plataforma y métricas resumidas.
 * Se oculta en pantallas menores a `lg` para dar prioridad al formulario.
 */
export async function AuthEditorialPanel() {
  const t = await getTranslations('Auth.editorial');

  return (
    <div className="relative flex flex-col justify-between p-12 overflow-hidden max-lg:hidden">
      {/* Marca */}
      <div className="relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/svg/brand-negative.svg"
          alt="Kotrip"
          className="h-8"
        />
      </div>

      {/* Marca de agua tipográfica */}
      <div className="absolute top-1/2 left-[-2%] -translate-y-1/2 font-[family-name:var(--font-cormorant)] text-[clamp(8rem,18vw,16rem)] font-bold text-white/[0.025] leading-[0.85] whitespace-nowrap select-none pointer-events-none">
        Viaja
      </div>

      {/* Línea vertical decorativa */}
      <div className="absolute right-0 top-[15%] h-[70%] w-px bg-gradient-to-b from-transparent via-[var(--primary-500)]/30 to-transparent" />

      {/* Contenido editorial */}
      <div className="relative z-10 my-auto max-w-[520px] px-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary-400)] tracking-[0.15em] uppercase mb-6 font-[family-name:var(--font-manrope)]">
          <div className="w-6 h-px bg-[var(--primary-500)]" />
          {t('tag')}
        </div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-[3.5rem] font-semibold text-[var(--text)] leading-[1.1] mb-5 tracking-[-0.02em]">
          {t('headline1')}
          <br />
          {t('headline2')}
          <br />
          <em className="italic text-[var(--primary-400)]">{t('headline3')}</em>
        </h1>
        <p className="text-base text-[var(--text-muted)] leading-[1.7] font-light max-w-[400px] font-[family-name:var(--font-manrope)]">
          {t('description')}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="relative z-10 flex gap-10">
        {(['trips', 'destinations', 'satisfaction'] as const).map((key) => (
          <div
            key={key}
            className="flex flex-col"
          >
            <span className="font-[family-name:var(--font-cormorant)] text-[2rem] font-bold text-[var(--text)]">
              {t(`stats.${key}.value`)}
            </span>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-[0.08em] mt-0.5 font-[family-name:var(--font-manrope)]">
              {t(`stats.${key}.label`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
