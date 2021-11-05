import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../extensionElements/propertiesHelper';

var helper = new propertiesHelper('apex:ExternalUrl');

export default function (element, bpmnFactory, translate) {
  const userTaskProps = [];

  // Only return an entry, if the currently selected element is a UserTask.
  if (
    is(element, 'bpmn:UserTask') &&
    getBusinessObject(element).type === 'externalUrl'
  ) {
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'url',
        label: translate('URL'),
        modelProperty: 'url',

        get: function (element) {
          return helper.getExtensionProperty(element, 'url');
        },

        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );
  }

  return userTaskProps;
}
