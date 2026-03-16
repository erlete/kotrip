'use client';

import { ViewType } from '@/hooks/use-view-type-storage';
import clsx from 'clsx';
import { LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

/**
 * Props del contenedor principal del layout de vista.
 */
interface ViewLayoutProps {
  /** Contenido del layout. */
  children: ReactNode;
  /** Identificador de prueba. */
  'data-testid'?: string;
  /** Clase CSS adicional. */
  className?: string;
}

/**
 * Props del toolbar del layout.
 */
interface ToolbarProps {
  /** Contenido del toolbar (toggle, acciones, etc.). */
  children: ReactNode;
}

/**
 * Props del toggle de vista.
 */
interface ViewToggleProps {
  /** Tipo de vista actual. */
  viewType: ViewType;
  /** Callback al cambiar el tipo de vista. */
  onViewTypeChange: (viewType: ViewType) => void;
  /** Etiqueta accesible para vista cuadrícula. */
  gridLabel?: string;
  /** Etiqueta accesible para vista lista. */
  listLabel?: string;
}

/**
 * Props de las acciones del toolbar.
 */
interface ActionsProps {
  /** Contenido de las acciones. */
  children?: ReactNode;
}

/**
 * Props del contenedor de contenido.
 */
interface ContentProps {
  /** Contenido a renderizar. */
  children: ReactNode;
  /** Tipo de vista para determinar el layout. */
  viewType: ViewType;
  /** Indica si el contenido está vacío. */
  isEmpty?: boolean;
  /** Clase CSS adicional. */
  className?: string;
}

/**
 * Props del skeleton de carga.
 */
interface SkeletonProps {
  /** Tipo de vista para determinar el estilo del skeleton. */
  variant: ViewType;
  /** Cantidad de elementos skeleton a mostrar. */
  count?: number;
}

/**
 * Props del wrapper de enlace para items.
 */
interface ItemLinkProps {
  /** URL de destino. */
  href: string;
  /** Contenido del enlace. */
  children: ReactNode;
  /** Identificador de prueba. */
  'data-testid'?: string;
  /** Clase CSS adicional. */
  className?: string;
  /** Estilos en línea adicionales. */
  style?: React.CSSProperties;
  /** Si es `true`, desactiva los estilos de enlace para usarlo como wrapper sin apariencia de link. */
  disableLink?: boolean;
  /** Props adicionales para el elemento raíz. */
  [key: string]: unknown;
}

/**
 * Props del mensaje de vacío.
 */
interface EmptyMessageProps {
  /** Título del mensaje. */
  title: string;
  /** Descripción del mensaje. */
  description?: string;
}

/**
 * Props del header del layout.
 */
interface HeaderProps {
  /** Contenido del header. */
  children: ReactNode;
  /** Clase CSS adicional. */
  className?: string;
}

/**
 * Props del título del header.
 */
interface TitleProps {
  /** Texto del título. */
  children: ReactNode;
  /** Clase CSS adicional. */
  className?: string;
}

/**
 * Props de la descripción del header.
 */
interface DescriptionProps {
  /** Contenido de la descripción. */
  children: ReactNode;
  /** Clase CSS adicional. */
  className?: string;
}

/**
 * Contenedor principal del layout de vista.
 * Proporciona estructura y espaciado consistente para vistas de listado.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del contenedor principal.
 */
function ViewLayoutRoot({
  children,
  'data-testid': dataTestId,
  className,
}: ViewLayoutProps) {
  return (
    <section
      className={clsx('flex justify-center py-10', className)}
      data-testid={dataTestId}
    >
      <div className="w-full max-w-[var(--container-xl)] flex flex-col gap-6">
        {children}
      </div>
    </section>
  );
}

/**
 * Barra de herramientas del layout.
 * Contiene el toggle de vista y las acciones.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del toolbar.
 */
function Toolbar({ children }: ToolbarProps) {
  return <div className="flex items-center justify-between">{children}</div>;
}

/**
 * Toggle para cambiar entre vista de cuadrícula y lista.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del toggle.
 */
function ViewToggle({
  viewType,
  onViewTypeChange,
  gridLabel,
  listLabel,
}: ViewToggleProps) {
  const t = useTranslations('Common');
  const resolvedGridLabel = gridLabel ?? t('gridView');
  const resolvedListLabel = listLabel ?? t('listView');

  return (
    <div className="flex bg-[var(--bg-dark)] p-1 rounded-[var(--rounded-sm)] gap-1 border border-[var(--border)]">
      <button
        className={clsx(
          'p-2 rounded-[var(--rounded-xs)] text-xs text-[var(--text-muted)] bg-transparent border-none cursor-pointer flex items-center justify-center transition-colors duration-200',
          'hover:text-[var(--text)] hover:bg-[var(--bg-light)]',
          viewType === 'grid' && 'bg-[var(--primary-500)] text-[var(--light)]',
        )}
        onClick={() => onViewTypeChange('grid')}
        aria-label={resolvedGridLabel}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        className={clsx(
          'p-2 rounded-[var(--rounded-xs)] text-xs text-[var(--text-muted)] bg-transparent border-none cursor-pointer flex items-center justify-center transition-colors duration-200',
          'hover:text-[var(--text)] hover:bg-[var(--bg-light)]',
          viewType === 'list' && 'bg-[var(--primary-500)] text-[var(--light)]',
        )}
        onClick={() => onViewTypeChange('list')}
        aria-label={resolvedListLabel}
      >
        <List size={16} />
      </button>
    </div>
  );
}

/**
 * Contenedor de acciones del toolbar.
 * Agrupa botones y controles adicionales.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del contenedor de acciones.
 */
function Actions({ children }: ActionsProps) {
  return <div className="flex items-center gap-3">{children}</div>;
}

/**
 * Contenedor de contenido con layout adaptativo.
 * Cambia entre grid y list según el viewType.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del contenedor de contenido.
 */
function Content({ children, viewType, isEmpty, className }: ContentProps) {
  return (
    <div
      key={viewType}
      className={clsx(
        'animate-[fadeIn_0.25s_ease-out]',
        isEmpty && '!block mt-8 mx-auto text-center',
        viewType === 'grid' &&
          'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6',
        viewType === 'list' && 'flex flex-col gap-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Cantidad por defecto de elementos skeleton. */
const DEFAULT_SKELETON_COUNT = 5;

/**
 * Componente skeleton para mostrar durante la carga.
 * Adapta su forma según el tipo de vista.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del skeleton.
 */
function Skeleton({ variant, count = DEFAULT_SKELETON_COUNT }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'rounded-[var(--rounded-lg)] bg-[var(--primary-300)] animate-pulse',
            variant === 'grid' ? 'h-48' : 'h-20',
          )}
        />
      ))}
    </>
  );
}

/**
 * Wrapper de enlace para items del listado.
 * Proporciona estilos de hover y transiciones consistentes.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del enlace.
 */
function ItemLink({
  href,
  children,
  'data-testid': dataTestId,
  className,
  style,
  disableLink = false,
  ...props
}: ItemLinkProps) {
  const t = useTranslations('Common');
  if (disableLink) {
    return (
      <div
        className={clsx(
          'no-underline text-inherit block rounded-[var(--rounded-lg)] transition-[transform,box-shadow] duration-200',
          'opacity-75 cursor-not-allowed',
          className,
        )}
        data-testid={dataTestId}
        style={style}
        title={t('itemLinkDisabledTooltip')}
        {...props}
      >
        {children}
      </div>
    );
  }
  // Importación dinámica de Link para evitar dependencia circular
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Link = require('next/link').default;
  return (
    <Link
      href={href}
      className={clsx(
        'no-underline text-inherit block rounded-[var(--rounded-lg)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--box-shadow)]',
        className,
      )}
      data-testid={dataTestId}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Mensaje para mostrar cuando el listado está vacío.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del mensaje vacío.
 */
function EmptyMessage({ title, description }: EmptyMessageProps) {
  return (
    <>
      <h2 className="text-[var(--text-muted)]">{title}</h2>
      {description && <p className="text-[var(--text-muted)]">{description}</p>}
    </>
  );
}

/**
 * Contenedor del header del layout.
 * Agrupa título y descripción con estilos consistentes.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del header.
 */
function Header({ children, className }: HeaderProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>{children}</div>
  );
}

/**
 * Título del header.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del título.
 */
function Title({ children, className }: TitleProps) {
  return (
    <h2
      className={clsx(
        'm-0 text-2xl font-semibold text-[var(--text)]',
        className,
      )}
    >
      {children}
    </h2>
  );
}

/**
 * Descripción del header.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX de la descripción.
 */
function Description({ children, className }: DescriptionProps) {
  return (
    <div
      className={clsx(
        'text-[var(--text-muted)] text-sm leading-relaxed',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Componente compuesto ViewLayout.
 * Proporciona estructura de layout reutilizable para vistas de listado
 * con soporte para toggle grid/list, skeleton, y estados vacíos.
 *
 * @example
 * ```tsx
 * <ViewLayout data-testid="my-view">
 *   <TitleComponent title="Mi listado" />
 *   <ViewLayout.Toolbar>
 *     <ViewLayout.ViewToggle
 *       viewType={viewType}
 *       onViewTypeChange={setViewType}
 *     />
 *     <ViewLayout.Actions>
 *       <Button>Nueva acción</Button>
 *     </ViewLayout.Actions>
 *   </ViewLayout.Toolbar>
 *   {!isHydrated ? (
 *     <ViewLayout.Skeleton variant="grid" />
 *   ) : (
 *     <ViewLayout.Content viewType={viewType}>
 *       {items.map(item => (
 *         <ViewLayout.ItemLink href={`/items/${item.id}`} key={item.id}>
 *           <ItemCard item={item} />
 *         </ViewLayout.ItemLink>
 *       ))}
 *     </ViewLayout.Content>
 *   )}
 * </ViewLayout>
 * ```
 */
export const ViewLayout = Object.assign(ViewLayoutRoot, {
  Header,
  Title,
  Description,
  Toolbar,
  ViewToggle,
  Actions,
  Content,
  Skeleton,
  ItemLink,
  EmptyMessage,
});
