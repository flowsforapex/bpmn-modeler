import { useService } from 'bpmn-js-properties-panel';

var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function Quickpick(element) {
  const translate = useService('translate');

  return jsxRuntime.jsx('div', {
    class: 'bio-properties-panel-quickpick',
    children: [
      jsxRuntime.jsx('a', {
        class: 'bio-properties-panel-quickpick-link',
        children: translate(element.text),
        onClick: element.handler
      })
    ]
  });
}

export function Quickpicks(list) {
  const translate = useService('translate');

  const quickpicks = [];
  
  list.forEach((element) => {
    quickpicks.push(
      jsxRuntime.jsx('a', {
        class: 'bio-properties-panel-quickpick-link',
        children: translate(element.text),
        onClick: element.handler
      })
    );
  });

  return jsxRuntime.jsx('div', {
    class: 'bio-properties-panel-quickpicks',
    children: quickpicks
  });
}