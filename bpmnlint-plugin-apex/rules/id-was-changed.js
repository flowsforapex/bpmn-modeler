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
      'bpmn:Definitions',
      'bpmn:Association',
      'bpmn:TextAnnotation',
      'bpmn:Process'
    ];
    const { id, $type, name } = businessObject;
    const isBoAccessableInUi = id && notChangeableTypes.indexOf(businessObject.$type) < 0;

    if (isBoAccessableInUi) {
      const stringAfterUnderscore = id.substr(id.indexOf('_') + 1);
      const patternUnchangedId = /^[0,1]{1}[\da-z]{6}$/;
      const isIdUnchanged = patternUnchangedId.test(stringAfterUnderscore);

      if (isIdUnchanged) {
        const isSequenceFlowWithoutName = $type === 'bpmn:SequenceFlow' && (!name || !name.length);

        if (!isSequenceFlowWithoutName) {
          reporter.report(businessObject.id, 'Element ID was not changed yet');
        }
      }
    }
  }

  return { check };
};

