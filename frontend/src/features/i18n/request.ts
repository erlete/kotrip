import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './actions';

/**
 * Configuracion de next-intl por solicitud.
 *
 * Resuelve el locale del usuario y carga dinamicamente el archivo
 * de mensajes correspondiente para cada peticion del servidor.
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
