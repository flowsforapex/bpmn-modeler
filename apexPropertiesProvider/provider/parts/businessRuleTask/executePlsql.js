import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../helper/propertiesHelper';
import { getContainer, openEditor } from '../../plugins/monacoEditor';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new propertiesHelper('apex:ExecutePlsql');

var forbiddenTypes = [];

export default function (element, bpmnFactory, commandStack, translate) {
  const taskProps = [];

  var { type } = getBusinessObject(element);

  if (
    is(element, 'bpmn:BusinessRuleTask') &&
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
          openEditor('plsqlCode', getPlsqlCode, savePlsqlCode, 'plsql');
        },
      })
    );
  }

  return taskProps;
}
