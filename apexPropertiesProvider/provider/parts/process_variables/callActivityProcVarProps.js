var { is } = require('bpmn-js/lib/util/ModelUtil');

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {
  if (is(element, 'bpmn:CallActivity')) {
    return procVarLists(element, bpmnFactory, translate, {
      type1: 'IntoCalledActivity',
      label1: translate('Into Called Activity'),
      type2: 'CalledActivityReturns',
      label2: translate('Called Activity Returns'),
    });
  }
}
