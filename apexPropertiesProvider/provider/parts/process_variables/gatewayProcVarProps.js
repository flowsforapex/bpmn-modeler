var { is } = require('bpmn-js/lib/util/ModelUtil');

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {
  if (
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway')
  ) {
    // opening gateway
    if (element.incoming.length === 1 && element.outgoing.length > 1) {
      return procVarLists(element, bpmnFactory, translate, {
        type1: 'BeforeSplit',
        label1: translate('Before Split'),
      });
    }
    // closing gateway
    else if (element.incoming.length > 1 && element.outgoing.length === 1) {
      return procVarLists(element, bpmnFactory, translate, {
        type1: 'AfterMerge',
        label1: translate('After Merge'),
      });
    } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
      return procVarLists(element, bpmnFactory, translate, {
        type1: 'AfterMerge',
        label1: translate('After Merge'),
        type2: 'BeforeSplit',
        label2: translate('Before Split'),
      });
    }
  }
}
