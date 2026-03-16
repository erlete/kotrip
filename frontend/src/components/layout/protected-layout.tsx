import Footer from '@/components/modules/footer/footer';
import TopbarComponent from '@/components/modules/topbar/Topbar';

type Props = {
  children: React.ReactNode;
};

/**
 * Layout principal para las páginas protegidas de la aplicación.
 *
 * Utiliza una estructura de filas: barra superior, contenido principal y pie de página.
 * La barra superior contiene la navegación, el selector de idioma y el perfil del usuario.
 */
export function ProtectedLayout({ children }: Props) {
  return (
    <div
      className="grid grid-rows-[auto_1fr_auto] min-h-dvh"
      data-testid="protected-layout"
      id="protected-layout"
    >
      <TopbarComponent />
      <main
        className="row-start-2 overflow-auto"
        role="main"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
