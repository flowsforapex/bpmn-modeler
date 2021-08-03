'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
const TimerEventDefinition = require('./TimerEventDefinition');

module.exports = function(group, element, bpmnFactory, terminationEventDefinition, elementRegistry, translate) {

    var getValue = function(modelProperty) {
    return function(element) {
        var modelPropertyValue = terminationEventDefinition.get('apex:' + modelProperty);
        var value = {};

        value[modelProperty] = modelPropertyValue;
        return value;
    };
    };

    var setValue = function(modelProperty) {
    return function(element, values) {
        var props = {};

        props['apex:' + modelProperty] = values[modelProperty] || undefined;

        return cmdHelper.updateBusinessObject(element, terminationEventDefinition, props);
};
  };

//   group.entries.push(entryFactory.selectBox(translate, {
//     id: 'processStatus',
//     label: translate('Process status after termination'),
//     modelProperty: 'processStatus',
//     selectOptions: [
//         { value: 'terminated', name: translate('Terminated') },
//         { value: 'completed', name: translate('Completed') }
//     ],

//     get: getValue('processStatus'),
//     set: setValue('processStatus')
//   }));

    group.entries.push(entryFactory.checkbox(translate, {
        id: 'processStatus',
        label: translate('Mark process as completed'),
        modelProperty: 'processStatus',
        description: 'Process will be marked as terminated by default.',

        get: function(element, node) {
            if (terminationEventDefinition.processStatus === undefined) {
                var command = cmdHelper.updateBusinessObject(element, terminationEventDefinition, { processStatus: 'terminated' });
                new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(command.context);
            }
            return {
                processStatus: (terminationEventDefinition.processStatus === 'completed')
            };
        },

        set: function(element, values) {
            values.processStatus = values.processStatus ? 'completed' : 'terminated';
            return cmdHelper.updateBusinessObject(element, terminationEventDefinition, values);
        }
    }));
};
