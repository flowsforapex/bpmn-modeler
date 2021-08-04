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
        description: translate('Application ID or Alias'),
        label: translate('Application'),
        modelProperty: 'apex-application'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-page',
        description: translate('Page ID or Alias'),
        label: translate('Page'),
        modelProperty: 'apex-page'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'apex-request'
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'apex-cache'
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-item',
        description: translate('Page Items to set'),
        label: translate('Page Items'),
        modelProperty: 'apex-item'
      })
    );
    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-value',
        description: translate('Page Item Values'),
        label: translate('Item Values'),
        modelProperty: 'apex-value'
      })
    );
  }

  return userTaskProps;
}
