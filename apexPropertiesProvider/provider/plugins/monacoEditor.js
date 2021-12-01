import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

var domQuery = require('min-dom').query;

export function getContainer(id) {
  return {
    id: `${id}-container`,
    html:
      `<div id="modal-dialog-${id}" class="modal">` +
      '<div id="modal-content" class="modal-content">' +
      '<div class="button-container start">' +
      '<button id="undo-btn" class="dialog undo fa fa-undo"></button>' +
      '<button id="redo-btn" class="dialog redo fa fa-repeat"></button>' +
      '<button id="search-btn" class="dialog search fa fa-search"></button>' +
      '<button id="parse-btn" class="dialog parse fa fa-check-circle-o"></button>' +
      '<span id="error-text"></span>' +
      '</div>' +
      '<div id="editor-container"></div>' +
      '<div class="button-container end">' +
      '<button id="close-btn" class="dialog close">Cancel</button>' +
      '<button id="save-btn" class="dialog save">Ok</button>' +
      '</div>' +
      '</div>',
  };
}

export function openEditor(id, getText, saveText, language) {
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
      apex.server.process(
        'PARSE_SQL',
        { x01: monacoEditor.getValue(), x02: language },
        {
          dataType: 'text',
          success: function (data) {
            domQuery(`#modal-dialog-${id} #error-text`).innerText =
              data.replace(/\n/g, ' ');
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('error');
          },
        }
      );
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
    saveText(monacoEditor.getValue());
    monacoEditor.dispose();
  };
}
