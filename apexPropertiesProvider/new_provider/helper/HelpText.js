var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function helptext(element) {

  return jsxRuntime.jsx('p', {
    class: 'bio-properties-panel-helptext',
    children: element.text
  });
}