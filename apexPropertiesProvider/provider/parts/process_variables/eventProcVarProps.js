import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { procVarLists } from './procVarLists';

export default function (
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
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
        e => e.$type === 'bpmn:TimerEventDefinition'
      )
    ) {
      return procVarLists(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate,
        {
          type1: 'BeforeEvent',
          label1: translate('Before Event'),
          name1: translate('BeforeEvent'),
          type2: 'OnEvent',
          label2: translate('On Event'),
          name2: translate('OnEvent'),
        }
      );
    }

    return procVarLists(
      element,
      bpmnFactory,
      elementRegistry,
      commandStack,
      translate,
      {
        type1: 'OnEvent',
        label1: translate('On Event'),
        name1: translate('OnEvent'),
      }
    );
  }
}
