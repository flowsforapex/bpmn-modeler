import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { isOptionSelected } from '../../../lib/formsHelper';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var domQuery = require('min-dom').query;

var factory;

var setProperty = function () {
  return function (element, values) {
    var commands = [];
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;

    if (!extensions) {
      extensions = elementHelper.createElement(
        'bpmn:ExtensionElements',
        {},
        bo,
        factory
      );
      commands.push(
        cmdHelper.updateProperties(element, { extensionElements: extensions })
      );
    }

    let [apexScript] = extensionElementsHelper.getExtensionElements(
      bo,
      'apex:ApexScript'
    );

    if (!apexScript) {
      apexScript = elementHelper.createElement(
        'apex:ApexScript',
        {},
        extensionElementsHelper,
        factory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, extensions, 'values', [apexScript])
      );
    }

    commands.push(cmdHelper.updateBusinessObject(element, apexScript, values));

    return commands;
  };
};

var getProperty = function (property) {
  return function (element) {
    var bo = getBusinessObject(element);

    const [apexScript] = extensionElementsHelper.getExtensionElements(
      bo,
      'apex:ApexScript'
    );

    return {
      [property]: apexScript && apexScript.get(property),
    };
  };
};

var monacoEditor;
var plsqlCodeField;

var handleOpenEditor = function () {
  return function (element, node, event) {
    var modal = document.getElementById('modalDialog');
    // Get the <span> element that closes the modal
    var save = document.getElementById('modalSave');
    var close = document.getElementById('modalClose');

    modal.style.display = 'block';

    // When the user clicks on <span> (x), close the modal
    save.onclick = function () {
      modal.style.display = 'none';
      savePlsqlCode(element, monacoEditor.getValue());
    };

    close.onclick = function () {
      modal.style.display = 'none';
    };

    if (!monacoEditor) {
      monacoEditor = editor.create(document.getElementById('editorContainer'), {
        value: [getPlsqlCode(element)].join('\n'),
        language: 'pgsql',
        minimap: { enabled: 'false' },
        automaticLayout: true,
      });
    } else {
      monacoEditor.getModel().setValue(getPlsqlCode(element));
    }
  };
};

function getPlsqlCode(element) {
  var bo = getBusinessObject(element);

  const [apexScript] = extensionElementsHelper.getExtensionElements(
    bo,
    'apex:ApexScript'
  );

  return apexScript && apexScript.get('plsqlCode');
}

function savePlsqlCode(element, plsqlCode) {
  const [apexScript] = extensionElementsHelper.getExtensionElements(
    getBusinessObject(element),
    'apex:ApexScript'
  );
  // TODO handle case when no apexScript object created yet
  apexScript.plsqlCode = plsqlCode;
  domQuery('#camunda-plsqlCode').textContent = plsqlCode;
}

export default function (element, bpmnFactory, translate) {
  const scriptTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const scriptTaskProps = [];

  if (is(element, 'bpmn:ScriptTask')) {
    factory = bpmnFactory;

    // if 'yes' then add 'autoBinds'
    scriptTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        description: translate('Use APEX_EXEC'),
        modelProperty: 'engine',
        label: translate('Engine'),
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' },
        ],
        set: setProperty(),
        get: getProperty('engine'),
      })
    );

    // Run PL/SQL Code

    plsqlCodeField = entryFactory.textBox(translate, {
      id: 'plsqlCode',
      description: translate('Enter the PL/SQL code to be executed.'),
      label: translate('PL/SQL Code'),
      modelProperty: 'plsqlCode',
      set: setProperty(),
      get: getProperty('plsqlCode'),
    });

    scriptTaskProps.push(plsqlCodeField);

    scriptTaskProps.push({
      id: 'plsqlCode-container',
      html:
        '<div id="modalDialog" class="modal">' +
        '<div id="modalContent" " class="modal-content">' +
        '<div id="buttonContainer">' +
        '<button id="modalParse" class="dialog parse fa fa-check"></button>' +
        '<button id="modalSave" class="dialog save fa fa-save"></button>' +
        '<button id="modalClose" class="dialog close fa fa-times"></button>' +
        '</div>' +
        '<div id="editorContainer"></div>' +
        '</div>',
    });

    scriptTaskProps.push(
      entryFactory.link(translate, {
        id: 'openEditor',
        buttonLabel: 'Open Editor',
        handleClick: handleOpenEditor(),
      })
    );

    // only shown, when APEX_EXEC is used
    scriptTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'autoBinds',
        description: translate(
          'Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.'
        ),
        label: translate('Bind Page Item Values'),
        modelProperty: 'autoBinds',
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' },
        ],
        hidden: function () {
          return isOptionSelected(scriptTaskEngine, engineNo);
        },
        set: setProperty(),
        get: getProperty('autoBinds'),
      })
    );
  }

  return scriptTaskProps;
}
