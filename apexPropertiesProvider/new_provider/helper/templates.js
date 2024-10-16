import { NumberFieldEntry, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from './util';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';

export function DefaultNumberEntry(props) {
  const { id, element, listElement, label, description, helper, property } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

   // business object passed in props for list elements
   const businessObject = listElement || getBusinessObject(element);

  const getValue = () =>
    (helper ? helper.getExtensionProperty(element, property) : businessObject[property]);

    const setValue = (value) => {
      if (helper) {
        helper.setExtensionProperty(element, modeling, bpmnFactory, {
          [property]: String(value),
        });
      } else {
        modeling.updateModdleProperties(element, businessObject, {
          [property]: String(value),
        });
      }
    };

  return NumberFieldEntry({
    id: id,
    element: element,
    label: label,
    description: description,
    getValue,
    setValue,
    debounce,
  });
}

export function DefaultTextFieldEntry(props) {
  const { id, element, listElement, label, description, helper, property, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () =>
    (helper ? helper.getExtensionProperty(element, property, parent) : businessObject[property]);

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      }, parent);
    } else {
      modeling.updateModdleProperties(element, businessObject, {
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
  const { id, element, listElement, label, description, helper, property, defaultValue, options, cleanup, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => {
    var value;

    if (defaultValue) {
      value = (helper ? (helper.getExtensionProperty(element, property, parent)) : businessObject[property]);

      if (!value || !options.some(v => v.value === value)) {
        if (helper) {
          helper.setExtensionProperty(element, modeling, bpmnFactory, {
            [property]: defaultValue,
          }, parent);
        } else {
          modeling.updateModdleProperties(element, businessObject, {
            [property]: defaultValue,
          });
        }
      }
    }

    return (helper ? helper.getExtensionProperty(element, property, parent) : businessObject[property]);
  };

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
        ...(cleanup && cleanup(value))
      }, parent);
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        [property]: value,
        ...(cleanup && cleanup(value))
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

export function DefaultSelectEntryAsync(props) {
  const { id, element, listElement, label, description, helper, property, state, needsRefresh } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getOptions = () => {
    const currValue = (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

    const existing =
      currValue == null || (state && state.values && state.values.map(e => e.value).includes(currValue));

    const result = [];

    // only return values if list will not be refreshed
    if (state && !needsRefresh) {
      // only if state loaded, current value is not null and does not exist in list
      if (state.loaded && currValue && !existing) {
        result.push({ label: `${currValue}*`, value: currValue });
      }
      // if state has values
      if (state.values) {
        result.push(
          ...state.values.map((s) => {
            return {
              label: s.label,
              value: s.value,
            };
          })
        );
      }
    }

    return result;
  };

  const getValue = () =>
    (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, {
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
    debounce: debounce,
    getOptions: getOptions,
  });
}

export function DefaultToggleSwitchEntry(props) {
  const { id, element, listElement, label, description, helper, property, defaultValue, invert, cleanup, cleanupHelper } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => {
    var value;
    
    if (defaultValue) {
      value = helper ? (helper.getExtensionProperty(element, property)) : businessObject[property];

      if (!value) {
        if (helper) {
          helper.setExtensionProperty(element, modeling, bpmnFactory, {
            [property]: defaultValue,
          });
        } else {
          modeling.updateModdleProperties(element, businessObject, {
            [property]: defaultValue,
          });
        }
      }
    }

    return helper ? (helper.getExtensionProperty(element, property) === (invert ? 'false' : 'true')) : (businessObject[property] === (invert ? 'false' : 'true'));
  };
    

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        // eslint-disable-next-line no-nested-ternary
        [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'),
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        // eslint-disable-next-line no-nested-ternary
        [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'),
      });
    }

    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        ...(cleanup && cleanup(value))
      });
    } else if (cleanupHelper) {
      cleanupHelper.setExtensionProperty(element, modeling, bpmnFactory, {
        ...(cleanup && cleanup(value))
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        ...(cleanup && cleanup(value))
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
  const { id, element, listElement, label, description, helper, property, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => (helper ? (helper.getExtensionProperty(element, property, parent)) : businessObject[property]);

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      }, parent);
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        [property]: value,
      });
    }
  };

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
  const { id, element, listElement, label, description, helper, property, language, type, parent } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // business object passed in props for list elements
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => (helper ? (helper.getExtensionProperty(element, property, parent)) : businessObject[property]);

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
      }, parent);
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        [property]: value,
      });
    }
  };

  const labelWithIcon =
    OpenDialogLabel(label, () => {
      var getProperty = () => (helper ? (helper.getExtensionProperty(element, property, parent)) : businessObject[property]);
      var saveProperty = function (text) {
        if (helper) {
          helper.setExtensionProperty(element, modeling, bpmnFactory, {
            [property]: text,
          }, parent);
        } else {
          modeling.updateModdleProperties(element, businessObject, {
            [property]: text,
          });
        }
      };
      openEditor(
        getProperty,
        saveProperty,
        language,
        type,
        id
      );
    });

  return [
    getContainer(translate, id),
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