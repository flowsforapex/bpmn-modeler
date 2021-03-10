import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

export default function (element, translate) {
  // Only return an entry, if the currently selected
  // element is a UserTask.
  const userTaskProps = [];

  if (is(element, 'bpmn:UserTask')) {
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-application',
        description: 'Application ID or Alias',
        label: 'Application',
        modelProperty: 'apex-application'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-page',
        description: 'Page ID or Alias',
        label: 'Page',
        modelProperty: 'apex-page'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-request',
        description: 'Request Value for Page Call',
        label: 'Request',
        modelProperty: 'apex-request'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-cache',
        description: 'Clear Cache Value for Page Call',
        label: 'Clear Cache',
        modelProperty: 'apex-cache'
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-item',
        description: 'Page Items to set',
        label: 'Page Items',
        modelProperty: 'apex-item'
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-value',
        description: 'Page Item Values',
        label: 'Item Values',
        modelProperty: 'apex-value'
      })
    );
  }

  return userTaskProps;
}
