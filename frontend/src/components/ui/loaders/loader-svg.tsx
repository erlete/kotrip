/**
 * Loader SVG con la marca del proyecto.
 * Muestra un gradiente animado a traves de una mascara SVG personalizada.
 * Los estilos se aplican mediante clases Tailwind y animaciones CSS en linea.
 */
const LoaderSVG = () => {
  return (
    <div className="flex h-full w-full items-center justify-center gap-8">
      <div className="h-60 w-60 animate-[loader-pan_1.25s_linear_infinite] bg-[length:200%_100%] bg-[linear-gradient(to_right,var(--secondary-400),var(--secondary-500),var(--secondary-700),var(--secondary-800))] [mask-size:contain] [mask:url('/assets/svg/brand-loader.svg')_no-repeat_center] [-webkit-mask-size:contain] [-webkit-mask:url('/assets/svg/brand-loader.svg')_no-repeat_center]" />
    </div>
  );
};

export default LoaderSVG;
