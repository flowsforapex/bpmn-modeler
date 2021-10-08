import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

export default function (element, bpmnFactory, translate) {
  const userTaskProps = [];

  // Only return an entry, if the currently selected element is a UserTask.
  if (
    is(element, 'bpmn:UserTask') &&
    getBusinessObject(element).type === 'externalUrl'
  ) {
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'externalUrl',
        description: translate('External URL'),
        label: translate('External URL'),
        modelProperty: 'externalUrl',
      })
    );
  }

  return userTaskProps;
}
