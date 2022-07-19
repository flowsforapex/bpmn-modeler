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
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway')
  ) {
    // opening gateway
    if (element.incoming.length === 1 && element.outgoing.length > 1) {
      return procVarLists(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate,
        {
          type1: 'BeforeSplit',
          label1: translate('Before Split'),
          name1: 'BeforeSplit',
        }
      );
    }
    // closing gateway
    else if (element.incoming.length > 1 && element.outgoing.length === 1) {
      return procVarLists(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate,
        {
          type1: 'AfterMerge',
          label1: translate('After Merge'),
          name1: 'AfterMerge',
        }
      );
    } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
      return procVarLists(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate,
        {
          type1: 'AfterMerge',
          label1: translate('After Merge'),
          name1: 'AfterMerge',
          type2: 'BeforeSplit',
          label2: translate('Before Split'),
          name2: 'BeforeSplit',
        }
      );
    }
  }
}
