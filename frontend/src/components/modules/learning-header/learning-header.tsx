import TitleComponent from '@/components/ui/title-component';

/**
 * Props del componente LearningHeader.
 */
interface LearningHeaderProps {
  /** Titulo principal de la cabecera. */
  title: string;
  /** Subtitulo o descripcion opcional. */
  subtitle?: string;
}

/**
 * Cabecera de seccion con titulo, subtitulo opcional y boton de retroceso.
 *
 * Utiliza TitleComponent internamente para renderizar el titulo
 * y la descripcion con un boton de navegacion hacia atras.
 */
const LearningHeader = ({ title, subtitle }: LearningHeaderProps) => {
  return (
    <section className="flex items-center gap-5 pt-10">
      <TitleComponent
        title={title}
        description={subtitle}
        backButton
      />
    </section>
  );
};

export default LearningHeader;
