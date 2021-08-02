var is = require('bpmn-js/lib/util/ModelUtil').is;

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, elementRegistry, translate) {

  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {

    return procVarLists(element, bpmnFactory, elementRegistry, translate, {
      type1: 'BeforeTask', label1: 'Before Task',
      type2: 'AfterTask', label2: 'After Task'
    });
  }
}