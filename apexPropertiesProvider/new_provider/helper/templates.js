import { SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';

export function DefaultTextFieldEntry(props) {
  const { id, element, label, description, helper, property } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    (helper ? helper.getExtensionProperty(element, property) : element.businessObject[property]);

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      });
    } else {
      modeling.updateProperties(element, {
        [property]: value,
      });
    }
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: label,
    description: description,
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

export function DefaultSelectEntry(props) {
  const { id, element, label, description, helper, property, defaultValue, options } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    var value;

    if (defaultValue) {
      value = (helper ? (helper.getExtensionProperty(element, property)) : element.businessObject[property]);

      if (!value) {
        if (helper) {
          helper.setExtensionProperty(element, modeling, bpmnFactory, {
            [property]: defaultValue,
          });
        } else {
          modeling.updateProperties(element, {
            [property]: defaultValue,
          });
        }
      }
    }

    return (helper ? helper.getExtensionProperty(element, property) : element.businessObject[property]);
  };

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      });
    } else {
      modeling.updateProperties(element, {
        [property]: value,
      });
    }
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: label,
    description: description,
    getValue: getValue,
    setValue: setValue,
    getOptions: () => options,
    debounce: debounce,
  });
}

export function DefaultToggleSwitchEntry(props) {
  const { id, element, label, description, helper, property, defaultValue, invert } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    var value;
    
    if (defaultValue) {
      value = helper ? (helper.getExtensionProperty(element, property)) : element.businessObject[property];

      if (!value) {
        if (helper) {
          helper.setExtensionProperty(element, modeling, bpmnFactory, {
            [property]: defaultValue,
          });
        } else {
          modeling.updateProperties(element, {
            [property]: defaultValue,
          });
        }
      }
    }

    return helper ? (helper.getExtensionProperty(element, property) === (invert ? 'false' : 'true')) : (element.businessObject[property] === (invert ? 'false' : 'true'));
  };
    

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'),
      });
    } else {
      modeling.updateProperties(element, {
        [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'),
      });
    }
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: label,
    description: description,
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

export function DefaultTextAreaEntry(props) {
  const { id, element, label, description, helper, property } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    helper.getExtensionProperty(element, property);

  const setValue = value =>
    helper.setExtensionProperty(element, modeling, bpmnFactory, {
      [property]: value,
    });

  return new TextAreaEntry({
    id: id,
    element: element,
    label: label,
    description: description,
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

export function DefaultTextAreaEntryWithEditor(props) {
  const { id, element, label, description, helper, property, language, type } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    helper.getExtensionProperty(element, property);

  const setValue = value =>
    helper.setExtensionProperty(element, modeling, bpmnFactory, {
      [property]: value,
    });

  const labelWithIcon =
    OpenDialogLabel(label, () => {
      var getProperty = function () {
        return helper.getExtensionProperty(element, property);
      };
      var saveProperty = function (text) {
        helper.setExtensionProperty(element, modeling, bpmnFactory, {
          [property]: text,
        });
      };
      openEditor(
        property,
        getProperty,
        saveProperty,
        language,
        type
      );
    });

  return [
    getContainer(property, translate),
    new TextAreaEntry({
      id: id,
      element: element,
      label: labelWithIcon,
      description: description,
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    })
  ];
}