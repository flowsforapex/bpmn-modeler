import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from '../../helper/getBusinessObjectHelper';
import { procVarLists } from './procVarLists';

export default function (
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  if (
    // process elements
    (is(element, 'bpmn:Process') &&
      getBusinessObject(element).isCallable === 'true') ||
    // participants
    (is(element, 'bpmn:Participant') &&
      getBusinessObject(element).isCallable === 'true')
  ) {
    return procVarLists(
      element,
      bpmnFactory,
      elementRegistry,
      commandStack,
      translate,
      {
        type1: 'InVariables',
        label1: translate('In Variables'),
        type2: 'OutVariables',
        label2: translate('Out Variables'),
      }
    );
  }
}
