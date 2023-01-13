var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function Quickpick(element) {

  return jsxRuntime.jsx('div', {
    class: 'bio-properties-panel-quickpick',
    children: [
      jsxRuntime.jsx('a', {
        class: 'bio-properties-panel-quickpick-link',
        children: element.text,
        onClick: element.handler
      })
    ]
  });
}

export function Quickpicks(list) {

  const quickpicks = [];
  
  list.forEach((element) => {
    quickpicks.push(
      jsxRuntime.jsx('a', {
        class: 'bio-properties-panel-quickpick-link',
        children: element.text,
        onClick: element.handler
      })
    );
  });

  return jsxRuntime.jsx('div', {
    class: 'bio-properties-panel-quickpicks',
    children: quickpicks
  });
}