/**
 * ### CollapsePlugin
 *
 * Plugin de swagger para colapsar y expandir todos los menus.
 * Añade botones de colapsar y expandir en la interfaz de Swagger.
 *
 * Este plugin proporciona dos botones en la interfaz de Swagger UI:
 * - **Collapse All**: Colapsa todos los endpoints expandidos
 * - **Expand All**: Expande todos los endpoints colapsados
 *
 * Los botones se posicionan en la parte superior de la lista de operaciones
 * para facilitar la navegación cuando hay muchos endpoints.
 *
 * @version     1.0.0a

 * @see         [pluginApi](https://swagger.io/docs/open-source-tools/swagger-ui/customization/plugin-api/)
 *
 * @example
 * ```typescript
 * // Usage in Swagger setup
 * uiOptions['plugins'] = [CollapsePlugin];
 * ```
 */
export const CollapsePlugin = {
  wrapComponents: {
    // Adding buttons to the operations container
    operations: (Original: any, system: any) => (props: any) => {
      // Buttons
      const collapseAllButton = system.React.createElement(
        'button',
        {
          className: 'btn',
          onClick: () => {
            // Find all expanded operation buttons and click them
            const expandedButtons = document.querySelectorAll(
              'button.expand-operation[aria-expanded="true"]',
            );
            expandedButtons.forEach((button) => {
              (button as HTMLButtonElement).click();
            });
          },
          style: {
            marginBottom: '10px',
            marginRight: '10px',
          },
        },
        'Collapse All',
      );

      const expandAllButton = system.React.createElement(
        'button',
        {
          className: 'btn',
          onClick: () => {
            // Find all collapsed operation buttons and click them
            const collapsedButtons = document.querySelectorAll(
              'button.expand-operation[aria-expanded="false"]',
            );
            collapsedButtons.forEach((button) => {
              (button as HTMLButtonElement).click();
            });
          },
          style: {
            marginBottom: '10px',
            marginRight: '10px',
          },
        },
        'Expand All',
      );

      // Div pfor the buttons
      const buttonContainer = system.React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1em',
            padding: '10px',
          },
        },
        [collapseAllButton, expandAllButton],
      );

      // Put button container before the original content
      return system.React.createElement('div', null, [
        buttonContainer,
        system.React.createElement(Original, props),
      ]);
    },
  },
};
