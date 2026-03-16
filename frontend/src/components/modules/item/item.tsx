'use client';

import { Button } from '@heroui/react';
import clsx from 'clsx';
import { SquarePen } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Propiedades del contenedor de item en vista de cuadrícula.
 */
interface ItemGridProps {
  /** Contenido del item. */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor principal para items en vista de cuadrícula.
 *
 * Renderiza una tarjeta con estructura flex en columna, efectos de hover
 * y estilos consistentes según el sistema de diseño.
 */
function ItemGrid({ children, className }: ItemGridProps) {
  return (
    <article
      className={clsx(
        'flex flex-col gap-0 rounded-[var(--rounded-lg)] border border-[var(--border)] bg-[var(--bg)] h-full overflow-hidden transition-[box-shadow,transform] duration-200',
        '[data-disabled="false"]_&:cursor-pointer [data-disabled="false"]_&:hover:shadow-[var(--shadow)] [data-disabled="false"]_&:hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </article>
  );
}

/**
 * Propiedades del contenedor de item en vista de lista.
 */
interface ItemListProps {
  /** Contenido del item. */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor principal para items en vista de lista.
 *
 * Renderiza una fila horizontal con espaciado, bordes y efectos de hover
 * consistentes según el sistema de diseño.
 */
function ItemList({ children, className }: ItemListProps) {
  return (
    <article
      className={clsx(
        'flex items-center gap-6 p-4 rounded-[var(--rounded-lg)] border border-[var(--border)] bg-[var(--bg-dark)]',
        className,
      )}
    >
      {children}
    </article>
  );
}

/**
 * Propiedades del header del item (vista grid).
 */
interface ItemHeaderProps {
  /** Contenido del header (poster, badges, botón de edición). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Cabecera del item en vista de cuadrícula.
 *
 * Contiene el poster/imagen y elementos superpuestos como badges
 * y el botón de edición.
 */
function ItemHeader({ children, className }: ItemHeaderProps) {
  return (
    <div
      className={clsx(
        'relative aspect-video bg-[var(--primary-50)] flex items-start justify-between overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades del contenido del header en vista grid.
 */
interface ItemHeaderContentProps {
  /** Contenido (badges, chips). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de contenido superpuesto en el header (badges, orden, etc.).
 */
function ItemHeaderContent({ children, className }: ItemHeaderContentProps) {
  return (
    <div
      className={clsx(
        'absolute top-4 left-4 flex items-center gap-2 z-[var(--z-items)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades del media del item (vista lista).
 */
interface ItemMediaProps {
  /** Contenido del media (poster/imagen). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de media para vista de lista.
 *
 * Renderiza un contenedor cuadrado para el poster/imagen del item.
 */
function ItemMedia({ children, className }: ItemMediaProps) {
  return (
    <div
      className={clsx(
        'w-16 h-16 rounded-[var(--rounded-lg)] bg-[var(--primary-50)] shrink-0 flex items-center justify-center overflow-hidden [&_img]:w-full [&_img]:h-full [&_img]:object-cover',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades del contenido principal del item.
 */
interface ItemContentProps {
  /** Contenido (meta, título, descripción). */
  children: ReactNode;
  /** Variante del contenido según el tipo de vista. */
  variant?: 'grid' | 'list';
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de contenido principal del item.
 *
 * Incluye metadatos, título y descripción del item.
 */
function ItemContent({
  children,
  variant = 'grid',
  className,
}: ItemContentProps) {
  return (
    <div
      className={clsx(
        variant === 'grid'
          ? 'bg-[var(--bg-dark)] flex-1 p-5 flex flex-col'
          : 'flex-1 min-w-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades del área lateral del item (vista lista).
 */
interface ItemAsideProps {
  /** Contenido del aside (fechas, botón de edición). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Área lateral del item en vista de lista.
 *
 * Contiene información secundaria como fechas y acciones.
 */
function ItemAside({ children, className }: ItemAsideProps) {
  return (
    <div className={clsx('flex items-center gap-6 shrink-0', className)}>
      {children}
    </div>
  );
}

/**
 * Propiedades del contenedor de metadatos.
 */
interface ItemMetaProps {
  /** Contenido de metadatos (badges, chips). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de metadatos del item.
 *
 * Agrupa badges, chips y etiquetas de estado.
 */
function ItemMeta({ children, className }: ItemMetaProps) {
  return (
    <div className={clsx('flex items-center gap-2 mb-2 flex-wrap', className)}>
      {children}
    </div>
  );
}

/**
 * Propiedades del título del item.
 */
interface ItemTitleProps {
  /** Texto o contenido del título. */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Título del item.
 *
 * Renderiza el título principal con estilos tipográficos consistentes.
 */
function ItemTitle({ children, className }: ItemTitleProps) {
  return (
    <h3 className={clsx('text-xl font-semibold text-[var(--text)]', className)}>
      {children}
    </h3>
  );
}

/**
 * Propiedades del badge del item.
 */
interface ItemBadgeProps {
  /** Contenido del badge (texto, icono). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Badge/etiqueta del item.
 *
 * Se usa para mostrar categorías, códigos, números de orden, etc.
 */
function ItemBadge({ children, className }: ItemBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 py-1 px-2 text-xs font-semibold text-[var(--secondary-950)] bg-[var(--secondary-50)] rounded-[var(--rounded-lg)] whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Propiedades del chip del item.
 */
interface ItemChipProps {
  /** Contenido del chip (texto, icono). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Chip del item.
 *
 * Se usa para mostrar información con iconos (modo de participación, tipo, etc.).
 */
function ItemChip({ children, className }: ItemChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 py-1 px-2 text-xs font-medium text-[var(--primary-950)] bg-[var(--primary-50)] rounded-[var(--rounded-lg)] whitespace-nowrap [&_svg]:shrink-0',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Propiedades del contenedor de información.
 */
interface ItemInfoProps {
  /** Contenido de información (fechas, atributos). */
  children: ReactNode;
  /** Variante según el tipo de vista. */
  variant?: 'grid' | 'list';
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de información secundaria del item.
 *
 * Agrupa fechas y otros atributos del item.
 */
function ItemInfo({ children, variant = 'grid', className }: ItemInfoProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-1.5 text-xs text-[var(--text-muted)]',
        variant === 'list' && 'text-right',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades de la fecha del item.
 */
interface ItemDateProps {
  /** Contenido de la fecha (icono y texto). */
  children: ReactNode;
  /** Variante según el tipo de vista. */
  variant?: 'grid' | 'list';
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Elemento de fecha del item.
 *
 * Muestra una fecha con icono asociado.
 */
function ItemDate({ children, variant = 'grid', className }: ItemDateProps) {
  return (
    <span
      className={clsx(
        'flex items-center gap-1.5 [&_svg]:shrink-0 [&_svg]:text-[var(--primary-500)]',
        variant === 'list' && 'justify-end',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Propiedades del botón de edición del item.
 */
interface ItemEditButtonProps {
  /** Etiqueta accesible (aria-label). */
  label: string;
  /** Función que se ejecuta al presionar el botón. */
  onPress: () => void;
  /** Variante según el tipo de vista. */
  variant?: 'grid' | 'list';
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Botón de edición del item.
 *
 * Renderiza un botón con icono de edición, posicionado según la variante.
 */
function ItemEditButton({
  label,
  onPress,
  variant = 'grid',
  className,
}: ItemEditButtonProps) {
  return (
    <Button
      aria-label={label}
      onPress={onPress}
      isIconOnly
      variant="outline"
      className={clsx(
        'shrink-0',
        variant === 'grid' && '!absolute top-3 right-3 z-[var(--z-items)]',
        className,
      )}
      data-testid="metadata-edit-button"
    >
      <SquarePen size={16} />
    </Button>
  );
}

/**
 * Propiedades del wrapper auxiliar.
 */
interface ItemWrapperProps {
  /** Contenido del wrapper. */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Wrapper auxiliar para alineación de contenido.
 *
 * Se usa para empujar contenido hacia el final del contenedor.
 */
function ItemWrapper({ children, className }: ItemWrapperProps) {
  return <div className={clsx('mt-auto', className)}>{children}</div>;
}

/**
 * Propiedades del indicador de índice del item.
 */
interface ItemIndexProps {
  /** Contenido del indicador (icono o número). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Indicador circular de índice o icono del item.
 *
 * Renderiza un círculo con un número o icono, utilizado para
 * identificar visualmente el orden o tipo de un item en listados.
 */
function ItemIndex({ children, className }: ItemIndexProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center w-9 h-9 text-sm font-semibold text-[var(--light)] bg-[var(--primary-900)] rounded-full shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Propiedades del contenedor de acciones del item.
 */
interface ItemActionsProps {
  /** Botones de acción. */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Contenedor de acciones del item.
 *
 * Agrupa botones de acción en un contenedor flexible alineado horizontalmente.
 */
function ItemActions({ children, className }: ItemActionsProps) {
  return (
    <div className={clsx('flex items-center gap-2 shrink-0', className)}>
      {children}
    </div>
  );
}

/**
 * Propiedades del indicador de estado del item.
 */
interface ItemStatusBadgeProps {
  /** Contenido del badge (icono y texto). */
  children: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Indicador de estado inline del item.
 *
 * Muestra el estado del item (en progreso, completado, etc.)
 * como una píldora compacta con icono y texto.
 */
function ItemStatusBadge({ children, className }: ItemStatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 py-0.5 px-2 text-[0.6875rem] font-medium text-[var(--light)] bg-[var(--primary-900)] rounded-full whitespace-nowrap shrink-0 [&_svg]:w-3 [&_svg]:h-3',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Componente Item con subcomponentes compuestos.
 *
 * Proporciona una API de composición para construir tarjetas de items
 * (cursos, unidades, etc.) con estructura y estilos consistentes.
 *
 * @example
 * ```tsx
 * // Vista de cuadrícula
 * <Item.Grid>
 *   <Item.Header>
 *     <Poster ... />
 *     <Item.HeaderContent>
 *       <Item.Badge>CODE</Item.Badge>
 *     </Item.HeaderContent>
 *     <Item.EditButton label="Edit" onPress={handleEdit} variant="grid" />
 *   </Item.Header>
 *   <Item.Content variant="grid">
 *     <Item.Meta>
 *       <Item.Chip><Icon /> Label</Item.Chip>
 *     </Item.Meta>
 *     <Item.Title>Item Title</Item.Title>
 *     <Item.Info>
 *       <Item.Date><CalendarIcon /> Jan 1, 2024</Item.Date>
 *     </Item.Info>
 *   </Item.Content>
 * </Item.Grid>
 *
 * // Vista de lista
 * <Item.List>
 *   <Item.Media>
 *     <Poster ... />
 *   </Item.Media>
 *   <Item.Content variant="list">
 *     <Item.Meta>
 *       <Item.Badge>CODE</Item.Badge>
 *     </Item.Meta>
 *     <Item.Title>Item Title</Item.Title>
 *   </Item.Content>
 *   <Item.Aside>
 *     <Item.Info variant="list">
 *       <Item.Date variant="list"><Icon /> Date</Item.Date>
 *     </Item.Info>
 *     <Item.EditButton label="Edit" onPress={handleEdit} variant="list" />
 *   </Item.Aside>
 * </Item.List>
 * ```
 */
export const Item = {
  Grid: ItemGrid,
  List: ItemList,
  Header: ItemHeader,
  HeaderContent: ItemHeaderContent,
  Media: ItemMedia,
  Content: ItemContent,
  Aside: ItemAside,
  Meta: ItemMeta,
  Title: ItemTitle,
  Badge: ItemBadge,
  Chip: ItemChip,
  Info: ItemInfo,
  Date: ItemDate,
  EditButton: ItemEditButton,
  Wrapper: ItemWrapper,
  Index: ItemIndex,
  Actions: ItemActions,
  StatusBadge: ItemStatusBadge,
};
