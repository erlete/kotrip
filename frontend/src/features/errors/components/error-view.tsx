'use client';

import { RedirectCountdown } from '@/features/errors/components/redirect-countdown';
import { Button } from '@heroui/react';
import clsx from 'clsx';
import { FileQuestion, LockKeyhole, LucideIcon, ShieldX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

/**
 * Nombres de iconos soportados para las vistas de error.
 * Estos iconos están pre-importados en el componente para evitar
 * problemas de serialización entre Server y Client Components.
 */
export type ErrorViewIconName = 'fileQuestion' | 'lockKeyhole' | 'shieldX';

/**
 * Variantes visuales disponibles para el icono de la vista de error.
 * Cada variante aplica un modificador CSS específico que define el color del icono.
 */
export type ErrorViewIconVariant = 'warning' | 'unauthorized' | 'forbidden';

/**
 * Mapeo de nombres de icono a sus componentes Lucide correspondientes.
 */
const iconComponents: Record<ErrorViewIconName, LucideIcon> = {
  fileQuestion: FileQuestion,
  lockKeyhole: LockKeyhole,
  shieldX: ShieldX,
};

/**
 * Props de configuración para el componente ErrorView.
 *
 * @remarks
 * Este componente es presentacional: recibe todo el contenido de texto
 * ya traducido desde sus componentes padre. La responsabilidad de traducción
 * recae en cada vista concreta (NotFoundView, ForbiddenView, etc.),
 * garantizando tipado seguro con namespaces fijos de i18n.
 */
export interface ErrorViewProps {
  /**
   * Nombre del icono a mostrar en la cabecera del error.
   * Los iconos disponibles están pre-importados para evitar problemas
   * de serialización entre Server y Client Components.
   */
  icon: ErrorViewIconName;

  /**
   * Variante visual del icono que determina su color.
   */
  iconVariant: ErrorViewIconVariant;

  /** Título del error (ya traducido). */
  title: string;

  /** Descripción del error (ya traducida). */
  description: string;

  /** Título de la sección de sugerencias (ya traducido). */
  suggestionsTitle: string;

  /** Lista de sugerencias ya traducidas. */
  suggestions: string[];

  /**
   * Configuración de la redirección automática.
   */
  redirect: {
    /** Ruta a la que se redirigirá automáticamente. */
    path: string;
    /** Tiempo de espera en segundos antes de la redirección. */
    delay?: number;
    /** Nombre del destino ya traducido para la cuenta regresiva. */
    destination: string;
  };

  /**
   * Configuración del botón de acción principal.
   */
  action: {
    /** Texto del botón de acción (ya traducido). */
    label: string;
    /** Ruta de destino del botón. */
    href: string;
  };

  /**
   * Callback ejecutado al montar el componente.
   * Útil para efectos secundarios como limpiar cookies de autenticación.
   */
  onMount?: () => void;

  /**
   * Contenido adicional a renderizar antes de las sugerencias.
   */
  children?: ReactNode;
}

/**
 * Mapeo de variantes de icono a sus clases Tailwind correspondientes.
 */
const iconVariantClasses: Record<ErrorViewIconVariant, string> = {
  warning: 'text-[var(--warning-500)]',
  unauthorized: 'text-[var(--error-500)]',
  forbidden: 'text-[var(--error-500)]',
};

/** Tiempo de espera por defecto en segundos antes de la redirección automática. */
const REDIRECT_DELAY = 20;

/**
 * Componente presentacional genérico para vistas de error.
 *
 * @remarks
 * Proporciona una estructura unificada para mostrar páginas de error con:
 * - Icono configurable con variante de color
 * - Título y descripción ya traducidos
 * - Lista de sugerencias ya traducidas
 * - Botones de acción (volver y acción principal)
 * - Cuenta regresiva con redirección automática
 *
 * La traducción se delega a los componentes padre (vistas concretas),
 * donde el namespace de i18n es fijo y las claves son literales,
 * garantizando tipado seguro sin necesidad de aserciones.
 *
 * @param props - Props de configuración del componente.
 * @returns Elemento JSX de la vista de error.
 *
 * @example
 * ```tsx
 * <ErrorView
 *   icon="shieldX"
 *   iconVariant="forbidden"
 *   title="Acceso denegado"
 *   description="No tienes permiso para ver esta página."
 *   suggestionsTitle="Qué puedes hacer:"
 *   suggestions={["Contacta con tu administrador", "Volver atrás"]}
 *   redirect={{ path: '/home', delay: 20, destination: 'Inicio' }}
 *   action={{ label: 'Ir al inicio', href: '/home' }}
 * />
 * ```
 */
export function ErrorView({
  icon,
  iconVariant,
  title,
  description,
  suggestionsTitle,
  suggestions,
  redirect,
  action,
  onMount,
  children,
}: ErrorViewProps) {
  // Resolver el componente de icono a partir del nombre
  const Icon = iconComponents[icon];
  const router = useRouter();
  const tBtn = useTranslations('Buttons');

  /** Navega hacia atrás en el historial o redirige al inicio si no hay historial. */
  const handleBack = () => {
    if (window.history.length > 2) router.back();
    else router.push('/');
  };

  useEffect(() => {
    onMount?.();
    // Solo ejecutar una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article
      className="flex items-center justify-center p-8 px-4"
      data-testid="error-view"
    >
      <div className="max-w-[600px] w-full text-center text-[var(--text)]">
        <div
          className={clsx(
            'mx-auto mb-8 w-20 h-20 flex items-center justify-center',
            iconVariantClasses[iconVariant],
          )}
          data-testid="error-view__icon"
        >
          <Icon
            size={80}
            strokeWidth={2}
          />
        </div>

        <h1 className="text-[2rem] max-sm:text-2xl font-bold mb-4 text-[var(--text)]">
          {title}
        </h1>

        <p className="text-lg leading-7 text-[var(--text-muted)] mb-8">
          {description}
        </p>

        {children}

        <div className="mb-8 text-left shadow-[var(--shadow)] w-full rounded-[var(--rounded-lg)] border border-[var(--border)] bg-[var(--bg-dark)] p-6">
          <p className="font-semibold text-[var(--text)] mb-3">
            {suggestionsTitle}
          </p>
          <ul className="list-none p-0 m-0">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="relative pl-6 mb-2 text-[var(--text-muted)] leading-relaxed last:mb-0 before:content-['•'] before:absolute before:left-2 before:text-[var(--secondary-600)]"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 justify-center flex-wrap mb-8 max-sm:flex-col max-sm:w-full [&_button]:w-auto max-sm:[&_button]:w-full">
          <Button
            variant="outline"
            onPress={handleBack}
          >
            {tBtn('buttonBack')}
          </Button>
          <Link href={action.href}>
            <Button variant="secondary">{action.label}</Button>
          </Link>
        </div>

        <div className="pt-6 border-t border-[var(--border)]">
          <RedirectCountdown
            redirectPath={redirect.path}
            delay={redirect.delay ?? REDIRECT_DELAY}
            destination={redirect.destination}
          />
        </div>
      </div>
    </article>
  );
}
