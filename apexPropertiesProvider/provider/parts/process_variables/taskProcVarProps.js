var is = require('bpmn-js/lib/util/ModelUtil').is;

import procVarProps from './procVarProps';

export default function (element, bpmnFactory, translate) {

  var taskProcVarProps = [];

  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {

    taskProcVarProps = procVarProps(element, bpmnFactory, translate, {
      prePanelLabel: 'Pre-Task',
      postPanelLabel: 'Post-Task'
    });
  }

  return taskProcVarProps;
}
