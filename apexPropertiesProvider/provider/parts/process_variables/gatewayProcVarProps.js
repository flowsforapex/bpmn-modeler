var is = require('bpmn-js/lib/util/ModelUtil').is;

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {

  if (
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway')
  ) {

    // opening gateway
    if (element.incoming.length <= 1 && element.outgoing.length > 1) {
        return procVarLists(element, bpmnFactory, translate, {
            type1: 'apex:beforeSplit', label1: 'Before Split'
          });    
    }
    // closing gateway
    else if (element.incoming.length > 1 && element.outgoing.length <= 1) {
        return procVarLists(element, bpmnFactory, translate, {
            type1: 'apex:afterMerge', label1: 'After Merge'
          });
    }
    else {
        return procVarLists(element, bpmnFactory, translate, {
            type1: 'apex:afterMerge', label1: 'After Merge',
            type2: 'apex:beforeSplit', label2: 'Before Split'
          });
    }
  }
}
