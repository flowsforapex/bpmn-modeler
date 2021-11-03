var { is } = require('bpmn-js/lib/util/ModelUtil');
var { getBusinessObject } = require('bpmn-js/lib/util/ModelUtil');

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, translate) {
  if (
    is(element, 'bpmn:StartEvent') ||
    is(element, 'bpmn:IntermediateThrowEvent') ||
    is(element, 'bpmn:IntermediateCatchEvent') ||
    is(element, 'bpmn:BoundaryEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    if (
      getBusinessObject(element).eventDefinitions &&
      getBusinessObject(element).eventDefinitions.some(
        e => e.$type == 'bpmn:TimerEventDefinition'
      )
    ) {
      return procVarLists(element, bpmnFactory, translate, {
        type1: 'BeforeEvent',
        label1: translate('Before Event'),
        type2: 'OnEvent',
        label2: translate('On Event'),
      });
    }

    return procVarLists(element, bpmnFactory, translate, {
      type1: 'OnEvent',
      label1: translate('On Event'),
    });
  }
}
