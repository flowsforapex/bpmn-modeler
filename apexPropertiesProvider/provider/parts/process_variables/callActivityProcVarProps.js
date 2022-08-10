import { is } from 'bpmn-js/lib/util/ModelUtil';
import { procVarLists } from './procVarLists';

export default function (
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  if (is(element, 'bpmn:CallActivity')) {
    return procVarLists(
      element,
      bpmnFactory,
      elementRegistry,
      commandStack,
      translate,
      {
        type1: 'InVariables',
        label1: translate('In Variables'),
        name1: translate('In'),
        type2: 'OutVariables',
        label2: translate('Out Variables'),
        name2: translate('Out'),
      }
    );
  }
}
