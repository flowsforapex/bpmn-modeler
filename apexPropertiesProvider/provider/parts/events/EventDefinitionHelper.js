'use strict';
var EventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper');

EventDefinitionHelper.getTerminationEventDefinition = function(element) {
    return this.getEventDefinition(element, 'bpmn:TerminateEventDefinition');
};

module.exports = EventDefinitionHelper;