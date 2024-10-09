/**
 * A rule that warns when using conditional sequence flows without gateways.
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
        reporter.report(businessObject.id, 'SequenceFlow starting from non-Gateway element is conditional');
    }
  }

  return { check };
};