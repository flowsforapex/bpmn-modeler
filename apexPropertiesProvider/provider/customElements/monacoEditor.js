import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

export function getContainer() {
  return {
    id: 'plsqlCode-container',
    html:
      '<div id="modalDialog" class="modal">' +
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

export function openEditor(getText, saveText) {
  var modal = document.getElementById('modalDialog');

  var undoBtn = document.getElementById('undoBtn');
  var redoBtn = document.getElementById('redoBtn');
  var searchBtn = document.getElementById('searchBtn');
  var parseBtn = document.getElementById('parseBtn');
  var closeBtn = document.getElementById('closeBtn');
  var saveBtn = document.getElementById('saveBtn');

  var searchFlag = false;

  var theme =
    document.getElementsByClassName('flows4apex-modeler FLOWS-DARK').length > 0 ? 'vs-dark' : 'vs';

  var monacoEditor = editor.create(document.getElementById('editorContainer'), {
    value: [getText()].join('\n'),
    language: 'pgsql',
    minimap: { enabled: 'false' },
    automaticLayout: true,
    theme: theme,
  });

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

  document.getElementById('errorText').innerText = '';

  parseBtn.onclick = function () {
    apex.server.process(
      'PARSE_SQL',
      { x01: monacoEditor.getValue() },
      {
        dataType: 'text',
        success: function (data) {
          document.getElementById('errorText').innerText = data.replace(
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
