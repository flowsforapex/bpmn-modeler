import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (element, translate) {
  const scriptTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const scriptTaskProps = [];
  
  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:ManualTask') ||
    is(element, 'bpmn:ReceiveTask') ||
    is(element, 'bpmn:SendTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:UserTask')
  ) {
    scriptTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'procVarAfter',
        description: 'Process variable before the task',
        label: 'Process variable before the task',
        modelProperty: 'procVarAfter'
      })
    );
  }

  return scriptTaskProps;
}
