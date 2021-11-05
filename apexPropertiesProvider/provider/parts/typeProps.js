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
  var setProperty = function () {
    return function (element, values) {
      var bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, values);
    };
  };

  var getType = function (defaultValue) {
    return function (element) {
      var bo = getBusinessObject(element);
      var type = bo.get('type');

      if (typeof type === 'undefined') {
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

  // Only return an entry, if the currently selected element is a UserTask.
  if (is(element, 'bpmn:UserTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'userTaskType',
        label: translate('User Task Type'),
        modelProperty: 'type',
        selectOptions: [
          { name: translate('APEX Page'), value: 'apexPage' },
          { name: translate('External URL'), value: 'externalUrl' },
          { name: translate('Unified Task List'), value: 'unifiedTaskList' },
        ],
        get: getType('apexPage'),
        set: setProperty(),
      })
    );
    // Only return an entry, if the currently selected element is a UserTask.
  } else if (is(element, 'bpmn:ServiceTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'serviceTaskType',
        label: translate('Service Task Type'),
        modelProperty: 'type',
        selectOptions: [
          { name: translate('Execute PL/SQL'), value: 'executePlsql' },
          { name: translate('Send Mail'), value: 'apexMail' },
        ],
        get: getType('executePlsql'),
        set: setProperty(),
      })
    );
  }
}
