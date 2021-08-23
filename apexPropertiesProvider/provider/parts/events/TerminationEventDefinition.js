'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
const TimerEventDefinition = require('./TimerEventDefinition');

module.exports = function(group, element, bpmnFactory, terminationEventDefinition, elementRegistry, translate) {

    var getValue = function() {
        return function(element) {
            var processStatus = terminationEventDefinition.get('processStatus');

            if (typeof processStatus === 'undefined') {
                var command = cmdHelper.updateBusinessObject(element, terminationEventDefinition, { processStatus: 'completed' });
                new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(command.context);
            }
            
            return {
                processStatus: processStatus || undefined
            };
        };
    };

    var setValue = function() {
        return function(element, values) {

            return cmdHelper.updateBusinessObject(element, terminationEventDefinition, { processStatus: values['processStatus'] });
        };
    };

    group.entries.push(entryFactory.selectBox(translate, {
        id: 'processStatus',
        label: translate('Process status after termination'),
        modelProperty: 'processStatus',
        selectOptions: [
            { value: 'completed', name: translate('Completed') },
            { value: 'terminated', name: translate('Terminated') }
        ],

        get: getValue('processStatus'),
        set: setValue('processStatus')
    }));
};
