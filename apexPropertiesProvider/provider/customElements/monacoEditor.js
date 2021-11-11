import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

var domQuery = require('min-dom').query;

export function getContainer(id) {
  return {
    id: 'plsqlCode-container',
    html:
      `<div id="modalDialog_${id}" class="modal">` +
      '<div id="modalContent" class="modalContent">' +
      '<div class="buttonContainer start">' +
      '<button id="undoBtn" class="dialog undo fa fa-undo"></button>' +
      '<button id="redoBtn" class="dialog redo fa fa-repeat"></button>' +
      '<button id="searchBtn" class="dialog search fa fa-search"></button>' +
      '<button id="parseBtn" class="dialog parse fa fa-check-circle-o"></button>' +
      '<span id="errorText"></span>' +
      '</div>' +
      '<div id="editorContainer"></div>' +
      '<div class="buttonContainer end">' +
      '<button id="closeBtn" class="dialog close">Cancel</button>' +
      '<button id="saveBtn" class="dialog save">Ok</button>' +
      '</div>' +
      '</div>',
  };
}

export function openEditor(id, getText, saveText, language) {
  var modal = domQuery(`#modalDialog_${id}`);

  var undoBtn = domQuery(`#modalDialog_${id} #undoBtn`);
  var redoBtn = domQuery(`#modalDialog_${id} #redoBtn`);
  var searchBtn = domQuery(`#modalDialog_${id} #searchBtn`);
  var parseBtn = domQuery(`#modalDialog_${id} #parseBtn`);
  var closeBtn = domQuery(`#modalDialog_${id} #closeBtn`);
  var saveBtn = domQuery(`#modalDialog_${id} #saveBtn`);

  var searchFlag = false;

  var theme =
    document.getElementsByClassName('flows4apex-modeler FLOWS-DARK').length > 0 ? 'vs-dark' : 'vs';

  var monacoEditor = editor.create(
    domQuery(`#modalDialog_${id} #editorContainer`),
    {
      value: [getText()].join('\n'),
      language: (language === 'plsql' ? 'sql' : language) || 'sql',
      minimap: { enabled: 'false' },
      automaticLayout: true,
      theme: theme,
    }
  );

  modal.style.display = 'flex';

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

  domQuery(`#modalDialog_${id} #errorText`).innerText = '';

  if (language === 'plsql' || language === 'sql') {
    parseBtn.onclick = function () {
      apex.server.process(
        'PARSE_SQL',
        { x01: monacoEditor.getValue(), x02: language },
        {
          dataType: 'text',
          success: function (data) {
            domQuery(`#modalDialog_${id} #errorText`).innerText = data.replace(
              /\n/g,
              ' '
            );
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
    monacoEditor.dispose();
  };

  saveBtn.onclick = function () {
    modal.style.display = 'none';
    saveText(monacoEditor.getValue());
    monacoEditor.dispose();
  };
}
