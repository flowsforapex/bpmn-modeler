import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

var domQuery = require('min-dom').query;
var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

export function getContainer(id, translate) {
  const container = jsxRuntime.jsx('div', {
    id: `modal-dialog-${id}`,
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

  // `<div id="modal-dialog-${id}" class="modal">` +
  //   '<div id="modal-content" class="modal-content">' +
  //     '<div class="button-container start">' +
  //       '<button id="undo-btn" class="dialog undo fa fa-undo"></button>' +
  //       '<button id="redo-btn" class="dialog redo fa fa-repeat"></button>' +
  //       '<button id="search-btn" class="dialog search fa fa-search"></button>' +
  //       '<button id="parse-btn" class="dialog parse fa fa-check-circle-o"></button>' +
  //       '<span id="error-text"></span>' +
  //     '</div>' +
  //     '<div id="editor-container"></div>' +
  //     '<div class="button-container end">' +
  //       `<button id="close-btn" class="dialog close">${translate('Cancel')}</button>` +
  //       `<button id="save-btn" class="dialog save">${translate('Save')}</button>` +
  //     '</div>' +
  //   '</div>' +
  // '</div>';
  return container;
}

export function openEditor(id, getText, saveText, language, type) {
  var modal = domQuery(`#modal-dialog-${id}`);
  var parent = modal.parentNode;
  var container = domQuery('.dialog-container');

  var undoBtn = domQuery(`#modal-dialog-${id} #undo-btn`);
  var redoBtn = domQuery(`#modal-dialog-${id} #redo-btn`);
  var searchBtn = domQuery(`#modal-dialog-${id} #search-btn`);
  var parseBtn = domQuery(`#modal-dialog-${id} #parse-btn`);
  var closeBtn = domQuery(`#modal-dialog-${id} #close-btn`);
  var saveBtn = domQuery(`#modal-dialog-${id} #save-btn`);

  var searchFlag = false;

  var theme =
    document.getElementsByClassName('flows4apex-modeler FLOWS-DARK').length > 0 ? 'vs-dark' : 'vs';

  var monacoEditor = editor.create(
    domQuery(`#modal-dialog-${id} #editor-container`),
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

  domQuery(`#modal-dialog-${id} #error-text`).innerText = '';

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
          domQuery(`#modal-dialog-${id} #error-text`).innerText =
            pData.message.replace(/\n/g, ' ');
          switch (pData.success) {
            case 'true':
              domQuery(`#modal-dialog-${id} #error-text`).style.color =
                '#52B415';
              break;
            case 'false':
              domQuery(`#modal-dialog-${id} #error-text`).style.color =
                '#cc3333';
              break;
            default:
              domQuery(`#modal-dialog-${id} #error-text`).style.color =
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
