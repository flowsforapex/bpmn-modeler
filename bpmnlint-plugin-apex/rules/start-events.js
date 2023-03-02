/**
 * A rule that warns when using unsupported start event types.
 */
 module.exports = function () {
  function check(businessObject, reporter) {

    if (businessObject.$type === 'bpmn:StartEvent' && businessObject.eventDefinitions && businessObject.eventDefinitions[0]) {
      if (businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
          reporter.report(businessObject.id, 'Element has disallowed type <bpmn:MessageStartEvent>');
      } else if (businessObject.eventDefinitions[0].$type === 'bpmn:ConditionalEventDefinition') {
          reporter.report(businessObject.id, 'Element has disallowed type <bpmn:ConditionalStartEvent>');
      } else if (businessObject.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition') {
          reporter.report(businessObject.id, 'Element has disallowed type <bpmn:SignalStartEvent>');
      }
    }
  }

  return { check };
};