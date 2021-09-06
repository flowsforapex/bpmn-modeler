/**
 * A rule that warns when using gateways that merge and open in the same time.
 */
 module.exports = function () {
  function check(businessObject, reporter) {

    if (businessObject.$type === 'bpmn:ExclusiveGateway' || businessObject.$type === 'bpmn:ParallelGateway' || businessObject.$type === 'bpmn:InclusiveGateway') {
      if (businessObject.incoming.length > 1 && businessObject.outgoing.length > 1) {
        reporter.report(businessObject.id, 'A gateway should not merge and split at the same time');
      }
    }
  }

  return { check };
};