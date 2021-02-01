import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isIdValid } from 'bpmn-js-properties-panel/lib/Utils';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

export default function (group, element, translate) {
  group.entries.push(entryFactory.validationAwareTextField(translate, {
    id: 'id',
    label: translate('Id'),
    modelProperty: 'id',
    getProperty: function (element) {
      return getBusinessObject(element).id;
    },
    setProperty: function (element, properties) {
      const bo = getBusinessObject(element);
      const initialId = bo.$attrs.initialId || bo.id;
      const updatedElement = element.labelTarget || element;
      const updatedProperties = {
        initialId,
        ...properties
      };

      return cmdHelper.updateProperties(updatedElement, updatedProperties);
    },
    validate: function (element, values) {
      var idValue = values.id;
      var bo = getBusinessObject(element);
      var idError = isIdValid(bo, idValue, translate);

      return idError ? { id: idError } : {};
    }
  }));
}
