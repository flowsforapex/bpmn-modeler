import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

var fullUrl = document.currentScript.src;
var baseUrl = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);

window.MonacoEnvironment = {
  getWorkerUrl(moduleId, label) {
    return `${baseUrl}editor.worker.js`;
  },
};

export function openEditor(getText, saveText) {
  var modal = document.getElementById('modalDialog');

  var undoBtn = document.getElementById('undoBtn');
  var redoBtn = document.getElementById('redoBtn');
  // var searchBtn = document.getElementById('searchBtn');
  var parseBtn = document.getElementById('parseBtn');
  var closeBtn = document.getElementById('closeBtn');
  var saveBtn = document.getElementById('saveBtn');

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

  // searchBtn.onclick = function () {
  //   monacoEditor.getAction('actions.find').run();
  // };

  parseBtn.onclick = function () {};

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
