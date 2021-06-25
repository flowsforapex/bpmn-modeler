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
      type1: 'apex:beforeTask', label1: 'Before Task',
      type2: 'apex:afterTask', label2: 'After Task'
    });
  }
}
