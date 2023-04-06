
var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function OpenDialogLabel(label, handler) {

  return jsxRuntime.jsx('div', {
    class: 'open-dialog-label',
    children: [
      jsxRuntime.jsx('span', {
        children: label
      }),
      jsxRuntime.jsx('span', {
        class: 'fa fa-box-arrow-in-ne',
        onClick: handler
      })
    ]
  });
}