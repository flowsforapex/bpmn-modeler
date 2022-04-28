import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

export default function (
  group,
  elementRegistry,
  bpmnFactory,
  element,
  translate
) {
  var selectOptions = {
    userTask: [
      { name: translate('APEX Page'), value: 'apexPage' },
      // { name: translate('External URL'), value: 'externalUrl' },
      { name: translate('APEX Approval'), value: 'apexApproval' },
    ],
    serviceTask: [
      { name: translate('Execute PL/SQL'), value: 'executePlsql' },
      { name: translate('Send Mail'), value: 'sendMail' },
    ],
    scriptTask: [{ name: translate('Execute PL/SQL'), value: 'executePlsql' }],
    businessRuleTask: [
      { name: translate('Execute PL/SQL'), value: 'executePlsql' },
    ],
  };

  var setProperty = function () {
    return function (element, values) {
      var bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, values);
    };
  };

  var getProperty = function (elementType, defaultValue) {
    return function (element) {
      var bo = getBusinessObject(element);
      var type = bo.get('type');

      if (
        typeof type === 'undefined' ||
        !selectOptions[elementType].some(v => v.value === type)
      ) {
        var command = cmdHelper.updateBusinessObject(element, bo, {
          type: defaultValue,
        });
        new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
          command.context
        );
      }

      return {
        type: bo.get('type'),
      };
    };
  };

  var command;

  // type selection for User Tasks
  if (is(element, 'bpmn:UserTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'userTaskType',
        label: translate('User Task Type'),
        modelProperty: 'type',
        selectOptions: selectOptions.userTask,
        get: getProperty('userTask', 'apexPage'),
        set: setProperty(),
      })
    );
    // type selection for Service Tasks
  } else if (is(element, 'bpmn:ServiceTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'serviceTaskType',
        label: translate('Service Task Type'),
        modelProperty: 'type',
        selectOptions: selectOptions.serviceTask,
        get: getProperty('serviceTask', 'executePlsql'),
        set: setProperty(),
      })
    );
    // type selection for Script Tasks
  } else if (is(element, 'bpmn:ScriptTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'scriptTaskType',
        label: translate('Script Task Type'),
        modelProperty: 'type',
        selectOptions: selectOptions.scriptTask,
        get: getProperty('scriptTask', 'executePlsql'),
        set: setProperty(),
      })
    );
    // type selection for Business Rule Tasks
  } else if (is(element, 'bpmn:BusinessRuleTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'businessRuleTaskType',
        label: translate('Business Rule Task Type'),
        modelProperty: 'type',
        selectOptions: selectOptions.businessRuleTask,
        get: getProperty('businessRuleTask', 'executePlsql'),
        set: setProperty(),
      })
    );
    // remove type attribute
  } else {
    command = cmdHelper.updateBusinessObject(
      element,
      getBusinessObject(element),
      {
        type: undefined,
      }
    );
    new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
      command.context
    );
  }
}
