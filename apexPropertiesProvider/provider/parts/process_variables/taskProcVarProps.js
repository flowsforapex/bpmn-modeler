import { is } from 'bpmn-js/lib/util/ModelUtil';
import { procVarLists } from './procVarLists';

export default function (
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {
    return procVarLists(
      element,
      bpmnFactory,
      elementRegistry,
      commandStack,
      translate,
      {
        type1: 'BeforeTask',
        label1: translate('Before Task'),
        name1: translate('BeforeTask'),
        type2: 'AfterTask',
        label2: translate('After Task'),
        name2: translate('AfterTask'),
      }
    );
  }
}
