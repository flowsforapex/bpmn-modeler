/**
 * A rule that warns when using unsupported start event types.
 */
 module.exports = function () {
  function check(businessObject, reporter) {

    const CONDITIONAL_SOURCES = [
      'bpmn:ExclusiveGateway',
      'bpmn:InclusiveGateway',
      'bpmn:ComplexGateway',
    ];

    if (
      businessObject.$type === 'bpmn:SequenceFlow' &&
      !CONDITIONAL_SOURCES.includes(businessObject.sourceRef.$type) &&
      businessObject.conditionExpression
    ) {
        reporter.report(businessObject.id, 'Condition on non gateway path');
    }
  }

  return { check };
};