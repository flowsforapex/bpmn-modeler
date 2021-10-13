import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';
import { openEditor } from '../customElements/monacoEditor';
import {
  getExtensionProperty,
  setExtensionProperty
} from '../extensionElements/propertiesHelper';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

export default function (element, bpmnFactory, commandStack, translate) {
  const scriptTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const scriptTaskProps = [];

  var getPlsqlCode = function () {
    return getExtensionProperty(element, 'apex:ApexScript', 'plsqlCode')
      .plsqlCode;
  };

  var savePlsqlCode = function (text) {
    var commands = setExtensionProperty(
      element,
      bpmnFactory,
      'apex:ApexScript',
      {
        plsqlCode: text,
      }
    );
    new MultiCommandHandler(commandStack).preExecute(commands);
  };

  if (is(element, 'bpmn:ScriptTask')) {
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
        set: function (element, values) {
          return setExtensionProperty(
            element,
            bpmnFactory,
            'apex:ApexScript',
            values
          );
        },
        get: function (element) {
          return getExtensionProperty(element, 'apex:ApexScript', 'engine');
        },
      })
    );

    // Run PL/SQL Code
    scriptTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: translate('Enter the PL/SQL code to be executed.'),
        label: translate('PL/SQL Code'),
        modelProperty: 'plsqlCode',
        set: function (element, values) {
          return setExtensionProperty(
            element,
            bpmnFactory,
            'apex:ApexScript',
            values
          );
        },
        get: function (element) {
          return getExtensionProperty(element, 'apex:ApexScript', 'plsqlCode');
        },
      })
    );

    // container for script editor
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

    // link to script editor
    scriptTaskProps.push(
      entryFactory.link(translate, {
        id: 'openEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          openEditor(getPlsqlCode, savePlsqlCode);
        },
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
        set: function (element, values) {
          return setExtensionProperty(
            element,
            bpmnFactory,
            'apex:ApexScript',
            values
          );
        },
        get: function (element) {
          return getExtensionProperty(element, 'apex:ApexScript', 'autoBinds');
        },
      })
    );
  }

  return scriptTaskProps;
}
