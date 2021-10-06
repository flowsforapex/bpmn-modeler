import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

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

    let apexScript =
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexScript') &&
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexScript')[0];

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

    const apexScript =
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexScript') &&
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexScript')[0];

    return {
      [property]: apexScript && apexScript.get(property),
    };
  };
};

export default function (element, bpmnFactory, translate) {
  const serviceTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const serviceTaskProps = [];

  if (is(element, 'bpmn:ServiceTask')) {
    factory = bpmnFactory;

    // if 'yes' then add 'autoBinds'
    serviceTaskProps.push(
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
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: translate('Enter the PL/SQL code to be executed.'),
        label: translate('PL/SQL Code'),
        modelProperty: 'plsqlCode',
        set: setProperty(),
        get: getProperty('plsqlCode'),
      })
    );

    // only shown, when APEX_EXEC is used
    serviceTaskProps.push(
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
          return isOptionSelected(serviceTaskEngine, engineNo);
        },
        set: setProperty(),
        get: getProperty('autoBinds'),
      })
    );
  }

  return serviceTaskProps;
}
