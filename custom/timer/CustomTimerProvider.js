var eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper');

var timer = require('./TimerEventDefinition');

var LOW_PRIORITY = 500;

function CustomTimerProvider(propertiesPanel, bpmnFactory, translate) {
  
  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  this.getTabs = function (element) {

    return function (tabs) {
      
      const formTab = tabs.find(({ id }) => id === 'general');
      if (!formTab) {
        return tabs;
      }

      const { groups } = formTab;
      const formsGroup = groups.find(({ id }) => id === 'details');
      if (!formsGroup) {
        return tabs;
      }

      const { entries } = formsGroup;
      const formKeyEntry = entries.find(({ id }) => id === 'undefinedtimer-event-definition-type');
      if (!formKeyEntry) {
        return tabs;
      }

      const index = entries.indexOf(formKeyEntry);
      var timerEventDefinition = eventDefinitionHelper.getTimerEventDefinition(element);

      entries.splice(index, 1, timer(element, bpmnFactory, timerEventDefinition, translate));

      return tabs;
    };
  };
}

CustomTimerProvider.$inject = ['propertiesPanel', 'bpmnFactory', 'translate'];

export default {
  __init__: ['customTimerProvider'],
  customTimerProvider: ['type', CustomTimerProvider]
};
