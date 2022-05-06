var { is, getBusinessObject } = require('bpmn-js/lib/util/ModelUtil');

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {
  if (
    is(element, 'bpmn:Process') &&
    getBusinessObject(element).isCallable === 'true'
  ) {
    return procVarLists(element, bpmnFactory, translate, {
      type1: 'InVariables',
      label1: translate('In Variables'),
      type2: 'OutVariables',
      label2: translate('Out Variables'),
    });
  }
}
