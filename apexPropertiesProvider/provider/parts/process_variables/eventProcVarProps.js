var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

import { procVarLists } from './procVarLists';

export default function (element, bpmnFactory, elementRegistry, translate) {

  if (
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:IntermediateThrowEvent') ||
        is(element, 'bpmn:IntermediateCatchEvent') ||
        is(element, 'bpmn:BoundaryEvent') ||
        is(element, 'bpmn:EndEvent')
  ) {

    if (getBusinessObject(element).eventDefinitions && getBusinessObject(element).eventDefinitions.some(e => e.$type == 'bpmn:TimerEventDefinition')) {
        return procVarLists(element, bpmnFactory, elementRegistry, translate, {
            type1: 'BeforeEvent', label1: 'Before Event',
            type2: 'OnEvent', label2: 'On Event'
        });
    }
    else {
        return procVarLists(element, bpmnFactory, elementRegistry, translate, {
            type1: 'OnEvent', label1: 'On Event'
        });
    }
  }
}