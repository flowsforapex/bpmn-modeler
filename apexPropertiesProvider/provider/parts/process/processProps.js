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

  var getProperty = function (property, defaultValue) {
    return function (element) {
      var bo = getBusinessObject(element);
      var prop = bo.get(property);

      var command;

      if (typeof prop === 'undefined') {
        command = cmdHelper.updateBusinessObject(element, bo, {
          [property]: defaultValue,
        });
        new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
          command.context
        );
      }

      return {
        [property]: bo.get(property),
      };
    };
  };

  if (is(element, 'bpmn:Process')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'isCallable',
        label: translate('Is Callable'),
        description: translate(
          'Select if this diagram should be called in a call activity'
        ),
        modelProperty: 'isCallable',
        selectOptions: [
          { name: translate('Yes'), value: 'true' },
          { name: translate('No'), value: 'false' },
        ],
        get: getProperty('isCallable', 'false'),
        set: setProperty(),
      })
    );
  }
}
