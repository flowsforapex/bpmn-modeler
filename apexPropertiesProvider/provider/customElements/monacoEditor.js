import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { setExtensionProperty } from '../extensionElements/propertiesHelper';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

export function openEditor(element, factory, stack, type, property) {
  var modal = document.getElementById('modalDialog');
  var save = document.getElementById('modalSave');
  var close = document.getElementById('modalClose');

  var monacoEditor = editor.create(document.getElementById('editorContainer'), {
    value: [getText(element, type, property)].join('\n'),
    language: 'pgsql',
    minimap: { enabled: 'false' },
    automaticLayout: true,
  });

  modal.style.display = 'block';

  save.onclick = function () {
    modal.style.display = 'none';
    saveText(element, factory, stack, type, property, monacoEditor.getValue());
    monacoEditor.dispose();
  };

  close.onclick = function () {
    modal.style.display = 'none';
    monacoEditor.dispose();
  };
}

function getText(element, type, property) {
  var bo = getBusinessObject(element);

  const [extElement] = extensionElementsHelper.getExtensionElements(bo, type);

  return extElement && extElement.get(property);
}

function saveText(element, factory, stack, type, property, text) {
  var commands = setExtensionProperty(element, factory, type, {
    [property]: text,
  });
  new MultiCommandHandler(stack).preExecute(commands);
}
