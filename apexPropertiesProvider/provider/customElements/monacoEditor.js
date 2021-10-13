import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

export function openEditor(getText, saveText) {
  var modal = document.getElementById('modalDialog');
  var save = document.getElementById('modalSave');
  var close = document.getElementById('modalClose');

  var monacoEditor = editor.create(document.getElementById('editorContainer'), {
    value: [getText()].join('\n'),
    language: 'pgsql',
    minimap: { enabled: 'false' },
    automaticLayout: true,
  });

  modal.style.display = 'block';

  save.onclick = function () {
    modal.style.display = 'none';
    saveText(monacoEditor.getValue());
    monacoEditor.dispose();
  };

  close.onclick = function () {
    modal.style.display = 'none';
    monacoEditor.dispose();
  };
}
