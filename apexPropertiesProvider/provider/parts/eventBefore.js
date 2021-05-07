import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (element, translate) {
  const scriptTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const scriptTaskProps = [];
  
  if (
    is(element, 'bpmn:StartEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    scriptTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'evtStartBefore',
        description: 'Event variable before the event',
        label: 'Event variable before the event',
        modelProperty: 'evtStartBefore'
      })
    );
  }

  return scriptTaskProps;
}
