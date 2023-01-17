import { SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from './util';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';

export function DefaultTextFieldEntry(props) {
  const { id, element, label, description, helper, property } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element);

  const getValue = () =>
    (helper ? helper.getExtensionProperty(element, property) : businessObject[property]);

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
  const { id, element, label, description, helper, property, defaultValue, options, cleanup } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    var value;

    if (defaultValue) {
      value = (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

      if (!value || !options.some(v => v.value === value)) {
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

    return (helper ? helper.getExtensionProperty(element, property) : businessObject[property]);
  };

  const setValue = (value) => {
    if (helper) {
      helper.setExtensionProperty(element, modeling, bpmnFactory, {
        [property]: value,
        ...(cleanup && cleanup(value))
      });
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
  const { id, element, label, description, helper, property } = props;

  const { state, nextGetter, nextSetter } = props.hooks;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element);

  const getOptions = () => {
    const currValue = (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

    const existing =
      currValue == null || (state && state.map(e => e.value).includes(currValue));

    return state && [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...state.map((s) => {
        return {
          label: s.label,
          value: s.value,
        };
      }),
    ];
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

    // if (nextGetter && nextSetter) {
    //   nextGetter().then(s => nextSetter(s));
    // }
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
  const { id, element, label, description, helper, property, defaultValue, invert } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element);

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

  const businessObject = getBusinessObject(element);

  const getValue = () => (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

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

  const businessObject = getBusinessObject(element);

  const getValue = () => (helper ? (helper.getExtensionProperty(element, property)) : businessObject[property]);

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