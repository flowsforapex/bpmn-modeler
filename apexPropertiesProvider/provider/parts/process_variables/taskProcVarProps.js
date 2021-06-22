var is = require('bpmn-js/lib/util/ModelUtil').is;

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {

  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {

    return procVarLists(element, bpmnFactory, translate, {
      id1: 'preTask',
      label1: 'Pre Task',
      scope1: 'preTask',
      id2: 'postTask',
      label2: 'Post Task',
      scope2: 'postTask'
    });

  }
}
