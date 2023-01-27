import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

var domQuery = require('min-dom').query;
var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function getContainer(translate) {
  const container = jsxRuntime.jsx('div', {
    id: 'modal-dialog',
    class: 'modal',
    children: jsxRuntime.jsx('div', {
      id: 'modal-content',
      class: 'modal-content',
      children: [
        jsxRuntime.jsx('div', {
          class: 'button-container start',
          children: [
            jsxRuntime.jsx('button', {
              id: 'undo-btn',
              class: 'dialog undo fa fa-undo',
            }),
            jsxRuntime.jsx('button', {
              id: 'redo-btn',
              class: 'dialog redo fa fa-repeat',
            }),
            jsxRuntime.jsx('button', {
              id: 'search-btn',
              class: 'dialog search fa fa-search',
            }),
            jsxRuntime.jsx('button', {
              id: 'parse-btn',
              class: 'dialog parse fa fa-check-circle-o',
            }),
            jsxRuntime.jsx('span', {
              id: 'error-text',
            }),
          ],
        }),
        jsxRuntime.jsx('div', {
          id: 'editor-container',
        }),
        jsxRuntime.jsx('div', {
          class: 'button-container end',
          children: [
            jsxRuntime.jsx('button', {
              id: 'close-btn',
              class: 'dialog close',
              children: translate('Cancel'),
            }),
            jsxRuntime.jsx('button', {
              id: 'save-btn',
              class: 'dialog save',
              children: translate('Save'),
            }),
          ],
        }),
      ],
    }),
  });
  return container;
}

export function openEditor(getText, saveText, language, type) {
  const modal = domQuery('#modal-dialog');
  const parent = modal.parentNode;
  const container = domQuery('.dialog-container');

  const undoBtn = domQuery('#modal-dialog #undo-btn');
  const redoBtn = domQuery('#modal-dialog #redo-btn');
  const searchBtn = domQuery('#modal-dialog #search-btn');
  const parseBtn = domQuery('#modal-dialog #parse-btn');
  const closeBtn = domQuery('#modal-dialog #close-btn');
  const saveBtn = domQuery('#modal-dialog #save-btn');

  var searchFlag = false;

  const theme =
    document.getElementsByClassName('flows4apex-modeler FLOWS-DARK').length > 0 ? 'vs-dark' : 'vs';

  const monacoEditor = editor.create(
    domQuery('#modal-dialog #editor-container'),
    {
      value: [getText()].join('\n'),
      language: (language === 'plsql' ? 'sql' : language) || 'plaintext',
      minimap: { enabled: 'false' },
      automaticLayout: true,
      theme: theme,
    }
  );

  modal.style.display = 'flex';

  container.appendChild(modal);

  undoBtn.onclick = function () {
    monacoEditor.getModel().undo();
  };

  redoBtn.onclick = function () {
    monacoEditor.getModel().redo();
  };

  searchBtn.onclick = function () {
    searchFlag = !searchFlag;
    if (searchFlag) monacoEditor.getAction('actions.find').run();
    else monacoEditor.trigger('keyboard', 'closeFindWidget');
  };

  domQuery('#modal-dialog #error-text').innerText = '';

  if (language === 'plsql' || language === 'sql') {
    parseBtn.onclick = function () {
      // ajaxIdentifier
      var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
      // ajax process
      apex.server
        .plugin(
          ajaxIdentifier,
          {
            x01: 'PARSE_CODE',
            x02: monacoEditor.getValue(),
            x03: language,
            x04: type,
          },
          {}
        )
        .then((pData) => {
          domQuery('#modal-dialog #error-text').innerText =
            pData.message.replace(/\n/g, ' ');
          switch (pData.success) {
            case 'true':
              domQuery('#modal-dialog #error-text').style.color =
                '#52B415';
              break;
            case 'false':
              domQuery('#modal-dialog #error-text').style.color =
                '#cc3333';
              break;
            default:
              domQuery('#modal-dialog #error-text').style.color =
                'inherit';
          }
        });
    };
  } else {
    parseBtn.style.display = 'none';
  }

  closeBtn.onclick = function () {
    modal.style.display = 'none';
    parent.appendChild(modal);
    monacoEditor.dispose();
  };

  saveBtn.onclick = function () {
    modal.style.display = 'none';
    parent.appendChild(modal);
    saveText(monacoEditor.getValue());
    monacoEditor.dispose();
  };
}
