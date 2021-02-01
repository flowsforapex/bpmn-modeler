/**
 * A rule that checks if a businessObject's ID was changed.
 */
module.exports = function () {
  function check(businessObject, reporter) {
    const notChangeableTypes = [
      'bpmndi:BPMNDiagram',
      'bpmndi:BPMNPlane',
      'bpmndi:BPMNShape',
      'bpmndi:BPMNEdge',
      'bpmn:Definitions'
    ];
    const { id } = businessObject;
    const isBoAccessableInUi = id && notChangeableTypes.indexOf(businessObject.$type) < 0;
    const { initialId } = businessObject.$attrs;

    if (isBoAccessableInUi) {
      const isIdUnchanged = !initialId || initialId === id;

      if (isIdUnchanged) {
        reporter.report(businessObject.id, 'Element ID was not changed yet');
      }
    }
  }

  return { check };
};

