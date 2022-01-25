import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../../lib/formsHelper';
import propertiesHelper from '../../helper/propertiesHelper';
import { getContainer, openEditor } from '../../plugins/monacoEditor';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new propertiesHelper('apex:ExecutePlsql');

var forbiddenTypes = ['sendMail'];

export default function (element, bpmnFactory, commandStack, translate) {
  const taskEngine = '[name="engine"]';
  const engineNo = 0;
  const taskProps = [];

  var { type } = getBusinessObject(element);

  if (
    is(element, 'bpmn:ServiceTask') &&
    (typeof type === 'undefined' ||
      type === 'executePlsql' ||
      !forbiddenTypes.includes(type))
  ) {
    // Run PL/SQL Code
    taskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: translate('Enter the PL/SQL code to be executed.'),
        label: translate('PL/SQL Code'),
        modelProperty: 'plsqlCode',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'plsqlCode');
        },
      })
    );

    // container for plsql editor
    taskProps.push(getContainer('plsqlCode'));

    // link to script editor
    taskProps.push(
      entryFactory.link(translate, {
        id: 'plsqlCodeEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getPlsqlCode = function () {
            return helper.getExtensionProperty(element, 'plsqlCode').plsqlCode;
          };
          var savePlsqlCode = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              plsqlCode: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('plsqlCode', getPlsqlCode, savePlsqlCode, 'plsql', 'plsqlProcess');
        },
      })
    );

    // if 'yes' then add 'autoBinds'
    taskProps.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        // description: translate('Use APEX_EXEC'),
        modelProperty: 'engine',
        label: translate('Use APEX_EXEC'),
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes (deprecated)'), value: 'true' },
        ],
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'engine');
        },
      })
    );

    // only shown, when APEX_EXEC is used
    taskProps.push(
      entryFactory.selectBox(translate, {
        id: 'autoBinds',
        description: translate(
          'Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.'
        ),
        label: translate('Bind Page Item Values'),
        modelProperty: 'autoBinds',
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes (deprecated)'), value: 'true' },
        ],
        hidden: function () {
          return isOptionSelected(taskEngine, engineNo);
        },
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'autoBinds');
        },
      })
    );
  }

  return taskProps;
}
