/**
 * A ruleset for iterations and loops.
 */
 module.exports = function () {
  function check(businessObject, reporter) {

    if (
      businessObject.$type === 'bpmn:BoundaryEvent' &&
      businessObject.attachedToRef.$type === 'bpmn:SubProcess' &&
      businessObject.attachedToRef.loopCharacteristics
    ) {
      reporter.report(businessObject.id, 'Boundary events on iterating sub processes are currently not supported');
    }

    if (businessObject.$type === 'bpmn:CallActivity' && businessObject.loopCharacteristics) {
      reporter.report(businessObject.id, 'Iterating call activites are currently not supported');
    }
  }

  return { check };
};