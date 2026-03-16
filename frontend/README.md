# Guia frontend kotrip

Esta guía está en progreso, sé que es un poco larga pero si te falta contexto del proyecto, este es un buen comienzo (siempre puedes pasarselo a tu ia de confianza y que te lo resuma, no hay nada secreto).

## Arquitectura de carpetas

El proyecto utiliza una arquitectura basada en features, en lugar de una organización por tipo de archivo.

Este enfoque se conoce como Screaming Architecture.

Veamos el siguiente ejemplo:

```
src/
 ├── components/
 │    ├── Button.jsx
 │    ├── Card.jsx
 ├── pages/
 │    ├── Login.jsx
 │    ├── Dashboard.jsx
 ├── hooks/
 │    ├── useAuth.js
 │    ├── useFetch.js
 ├── services/
 │    ├── api.js
 ├── styles/
 │    ├── layout.css
 │    ├── theme.css
```

```
features/
 ├── auth/
 │    ├── components/
 │    │   ├── LoginForm.jsx
 │    ├── hooks/
 │    │   ├── useAuth.js
 │    ├── services/
 │    │   ├── auth.api.js
 │    ├── index.ts
 │
 ├── dashboard/
 │    ├── components/
 │    │   ├── DashboardHeader.jsx
 │    ├── hooks/
 │    │   ├── useDashboardData.js
 │    ├── services/
 │    │   ├── dashboard.api.js
```

### ¿Por qué?

A medida que crecen los proyectos en tamaño, el número de archivos por carpeta aumenta lo que dificulta encontrar dichos archivos. Además, al estar separados por tipo, encontraríamos separados los archivos de una misma feature por ejemplo, los estilos, la lógica, la utilidades, los servicios, etc estarían separados en distintas carpetas.

Esto dificulta encontrarlos y modificar una feature en concreto. La problemática aumenta cuando en el proyecto trabajan varias personas las cuales no tienen todo el contexto del proyecto. En este caso, los devs se beneficiarían de tener todos los archivos de una feature bajo el mismo directorio.

### ¿Cómo separar archivos?

A primera vista puede parecer complicado decidir cómo organizar los archivos usando esta arquitectura. Usemos de ejemplo los componentes usados en react/nextjs.

La regla de oro para saber si un componente debe guardarse bajo una feature o no es pensar si sería posible reutilizarlo en algún hipotético caso. Los componentes más sencillos son los atómicos, los base, como pueden ser un botón, select, input, etc.

Estos elementos genéricos no tienen complicación pero ¿y si hay un input especial para el login? en ese caso habría que analizar si ese input almacena algo relacionado con el login en sí, si lo hace debe colocarse bajo dicha feature, de lo contrario lo mejor sería guardarlo como genérico ya que podría llegar a usarse en otro momento. Otros casos son los componentes compuestos por otros componentes, por ejemplo un footer. Estos son genéricos por lo que irán en `/components`.

Entonces, ¿qué componentes van en las carpetas de features? Se añadirán a dichas carpetas los componentes que construyan dicha feature. Para ilustrarlo mejor, repasemos la idea de separación de componentes en react. Quizá la razón más intuitiva es la reutilización de código.

Sin embargo, en react muchas veces conviene separar ciertas partes de código por pura performance, de no hacer separación, en componentes grandes se juntan muchos States y otras cosas que influyen en los renders de la página. Para evitar re-renders innecesarios de toda una página, se pueden separar en piezas más pequeñas y así sólo se re-renderizan las partes que realmente cambiaron.

Dicho esto, queda claro que es necesario separar código aunque no se vaya a reutilizar, simplemente por rendimiento y mantenibilidad. Y justo esas separaciones de código son las que vivirán bajo la feature correspondiente.

#### Resumen!!

- En `/components` => componentes que se puedan reutilizar en muchos sitios (lo mismo para hooks, contexts, lib, etc).
- En `/features/x` => separación de código perteneciente únicamente a dicha feature (componentes, layouts, hooks, actions, etc).

## Estilos

sass (scss)

Se sigue la metodología ITCSS para organizar estilos. La idea es ordenar los estilos de lo más genérico a lo más específico, como un triángulo invertido. Settings, tools, generic, elements, object, components y utils. Esta forma de organizar los estilos es útil para tener una separación clara de cada cosa, evitar conflictos y colaborar en equipo.

ITSCSS y screaming architecture son totalmente compatibles, en nuestro caso en concreto sólo separamos los estilos de los componentes y objetos en algún caso. La idea es que estén donde estén los estilos sigan la misma idea de ITCSS, no es neesario que estén todos los estilos bajo un directorio global `/styles`.

Sobre el nombrado de clases, se utiliza BEM que significa Block - Element - Modifier. Es una metodología para nombrar clases CSS de forma clara, predecible y reutilizable. BEM no organiza archivos, solo define cómo se llaman las clases.

_Block_: Componente independiente y reutilizable.

```scss
.card {
}
.menu {
}
.button {
}
```

_Element_: Parte interna del bloque, no existe por sí sola.

```scss
.card__title {
}
.menu__item {
}
.button__icon {
}
```

_Modifier_: Variación de apariencia o estado.

```scss
.button--disabled {
}
.card--featured {
}
.menu__item--active {
}
```

En cuanto al nombrado de archivos, encontramos `globals.scss`como punto de entrada global, archivos que empiezan por `_` como `_utils` y archivos con la extensión `.module.scss` como `button.module.scss`.

- _SCSS con `_` (partials):\_ Archivos parciales (ej. \_variables.scss). No se compilan solos; se importan en otros SCSS para reutilizar estilos.
- _.module.scss:_ Estilos con scope local (CSS Modules), comunes en React/Next. Sus clases se transforman a nombres únicos para evitar conflictos entre componentes.

- _@use_ Importa un archivo SCSS y usa su contenido con un namespace (por defecto el nombre del archivo). Evita conflictos y reemplaza a @import. Ej: @use "variables"; -> usarías variables.$color.
- _@forward_ Re-exporta lo que otro archivo tiene (variables, mixins, funciones) para crear módulos “puente” o centralizar exports. Ej: un archivo index.scss hace @forward "variables"; @forward "mixins"; y luego otros solo usan @use "index";.

### Colours

Para la paleta de colores se usa un generador escrito en scss. Se ha decidido usar funciones generadoras para evitar el trabajo manual de definir cada color. Además, se ha optado por una nomenclatura basada en una escala por intensidad tipo tailwind; donde el más oscuro es color-0 y el más clarito color-900. Se basa en una configuración inicial con colores y otras variables para generla.

Una razón de este nombrado es evitar usar estados, como hover o active, para definir los colores y tampoco usar dark o light ya que da problemas para entenderlo. Otra razón de peso es alejarse de cambios manuales que puedan llevar a errores y gasto de tiempo innecesario.

Un caso claro sería que un cliente tenga como color primario o secundario uno de los colores usados como defaults (success, error, etc). En este caso, usando el generador, sólo habría que cambiar el color base y la paleta se generaría automáticamente.

No es un sistema perfecto pero sí tiene unas cuantas ventajas. Está pendiente de ser mejorado para cumplir mejor con ciertos contrastes y que haga mejor la paleta en general.

## Auth

En progreso.

## i18n

Se ha optado por un enfoque basado en cookies para la gestión del idioma, en lugar de utilizar sub-path routing (por ejemplo `/es`, `/en`).

La razón principal es simplificar la navegación y la lógica asociada al cambio de idioma. Cuando se usa sub-path routing, cambiar de idioma implica cambiar la URL, lo que el navegador interpreta como una nueva navegación.

Esto provoca problemas en el historial del navegador: al cambiar de idioma, se añade una nueva entrada al history, por lo que al pulsar “atrás” el usuario vuelve al idioma anterior en lugar de a la página anterior.

Notas: se ha incluido un `<Suspense>` por encima del `NextIntlClientProvider` para complacer con los requisitos de la política de caché de nextjs/react.

Simplificándolo, es necesario que el doc html esté formado por lo que no puede ser `asycn` ni usar funciones asíncronas; véase acceder a las cookies. Por eso mismo no se incluye el atributo `lang` en la etiqueta html, lo cuál es un inconveniente de SEO que se puede asumir.

## Theme

Se ha usado `ThemeServerBoundary` bajo un `<Suspense>` para poder acceder a las cookies del theme de manera asíncrona, por las mismas razones que con el provider de NextIntl (ver nota anterior).
