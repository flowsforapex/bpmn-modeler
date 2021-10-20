import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

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

    if (typeof type === 'undefined') bo.type = defaultValue;

    return {
      type: bo.get('type'),
    };
  };
};

export default function (group, element, translate) {
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
  }
}
