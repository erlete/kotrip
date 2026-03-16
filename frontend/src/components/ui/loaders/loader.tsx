import { Spinner as HeroSpinner } from '@heroui/react';

/**
 * Componente de carga generico.
 * Utiliza el Spinner de HeroUI v3 como indicador visual de actividad en curso.
 */
const Loader = () => {
  return (
    <HeroSpinner
      color="accent"
      size="md"
    />
  );
};

export default Loader;
