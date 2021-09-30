import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

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

    let apexPage =
      extensionElementsHelper.getExtensionElements(bo, 'apex:apexPage') &&
      extensionElementsHelper.getExtensionElements(bo, 'apex:apexPage')[0];

    if (!apexPage) {
      apexPage = elementHelper.createElement(
        'apex:apexPage',
        {},
        extensionElementsHelper,
        factory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, extensions, 'values', [apexPage])
      );
    }

    commands.push(cmdHelper.updateBusinessObject(element, apexPage, values));

    return commands;
  };
};

var getProperty = function (property) {
  return function (element) {
    var bo = getBusinessObject(element);

    const apexPage =
      extensionElementsHelper.getExtensionElements(bo, 'apex:apexPage') &&
      extensionElementsHelper.getExtensionElements(bo, 'apex:apexPage')[0];

    return {
      [property]: apexPage && apexPage.get(property),
    };
  };
};

export default function (element, bpmnFactory, translate) {
  // Only return an entry, if the currently selected
  // element is a UserTask.
  const userTaskProps = [];

  factory = bpmnFactory;

  if (is(element, 'bpmn:UserTask')) {
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-application',
        description: translate('Application ID or Alias'),
        label: translate('Application'),
        modelProperty: 'apex-application',
        set: setProperty(),
        get: getProperty('apex-application'),
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-page',
        description: translate('Page ID or Alias'),
        label: translate('Page'),
        modelProperty: 'apex-page',
        set: setProperty(),
        get: getProperty('apex-page'),
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'apex-request',
        set: setProperty(),
        get: getProperty('apex-request'),
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'apex-cache',
        set: setProperty(),
        get: getProperty('apex-cache'),
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-item',
        description: translate('Page Items to set'),
        label: translate('Page Items'),
        modelProperty: 'apex-item',
        set: setProperty(),
        get: getProperty('apex-item'),
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-value',
        description: translate('Page Item Values'),
        label: translate('Item Values'),
        modelProperty: 'apex-value',
        set: setProperty(),
        get: getProperty('apex-value'),
      })
    );
  }

  return userTaskProps;
}
