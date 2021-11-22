import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../../lib/formsHelper';
import { getContainer, openEditor } from '../../customElements/monacoEditor';
import propertiesHelper from '../../extensionElements/propertiesHelper';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new propertiesHelper('apex:ExecutePlsql');

var forbiddenTypes = [];

export default function (element, bpmnFactory, commandStack, translate) {
  const businessRuleTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const businessRuleTaskProps = [];

  var { type } = getBusinessObject(element);

  if (
    is(element, 'bpmn:BusinessRuleTask') &&
    (typeof type === 'undefined' ||
      type === 'executePlsql' ||
      !forbiddenTypes.includes(type))
  ) {
    // if 'yes' then add 'autoBinds'
    businessRuleTaskProps.push(
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
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'engine');
        },
      })
    );

    // Run PL/SQL Code
    businessRuleTaskProps.push(
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

    // container for script editor
    businessRuleTaskProps.push(getContainer('plsqlCode'));

    // link to script editor
    businessRuleTaskProps.push(
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
          openEditor('plsqlCode', getPlsqlCode, savePlsqlCode, 'plsql');
        },
      })
    );

    // only shown, when APEX_EXEC is used
    businessRuleTaskProps.push(
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
          return isOptionSelected(businessRuleTaskEngine, engineNo);
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

  return businessRuleTaskProps;
}
