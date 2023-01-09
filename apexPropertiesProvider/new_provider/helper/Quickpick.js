import { useService } from 'bpmn-js-properties-panel';

var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function quickpicks(list) {
  const translate = useService('translate');

  const quickpicks = [];
  
  list.forEach((element) => {
    quickpicks.push(
      jsxRuntime.jsx('a', {
        class: 'bio-properties-panel-quickpick',
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