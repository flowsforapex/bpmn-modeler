import { NumberFieldEntry, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from './util';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';

const genericGetValue = ({helper, element, listElement, property, parent, businessObject} = {}) => {

  if (helper) {
    return helper.getProperty({element, listElement, property, parent});
  }
  return businessObject[property];
};

const genericSetValue = ({helper, element, listElement, values, parent, businessObject, modeling, bpmnFactory} = {}) => {

  if (helper) {
    helper.setProperty({element, listElement, values, parent, modeling, bpmnFactory});
  } else {
    modeling.updateModdleProperties(element, businessObject, values);
  }
};

export function DefaultNumberEntry(props) {
  const { id, element, listElement, label, description, helper, property } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => genericGetValue({
    helper,
    element,
    listElement,
    property,
    businessObject
  });

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value ? String(value) : value,
    },
    businessObject,
    modeling,
    bpmnFactory
  });

  return NumberFieldEntry({
    id,
    element,
    label,
    description,
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

  
  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => genericGetValue({
    helper,
    element,
    listElement,
    property,
    parent,
    businessObject
  });

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value,
    },
    parent,
    businessObject,
    modeling,
    bpmnFactory
  });

  return new TextFieldEntry({
    id,
    element,
    label,
    description,
    getValue,
    setValue,
    debounce,
  });
}

export function DefaultSelectEntry(props) {
  const { id, element, listElement, label, description, helper, property, defaultValue, options, cleanup, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => {
    let value;

    if (defaultValue) {

      value = genericGetValue({
        helper,
        element,
        listElement,
        property,
        parent,
        businessObject
      });

      if (!value || !options.some(v => v.value === value)) {
        genericSetValue({
          helper,
          element,
          listElement,
          values: {
            [property]: defaultValue,
          },
          parent,
          businessObject,
          modeling,
          bpmnFactory
        });
      }
    }

    return genericGetValue({
      helper,
      element,
      listElement,
      property,
      parent,
      businessObject
    });
  };

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value,
      ...(cleanup && cleanup(value))
    },
    parent,
    businessObject,
    modeling,
    bpmnFactory
  });

  return new SelectEntry({
    id,
    element,
    label,
    description,
    getValue,
    setValue,
    getOptions: () => options,
    debounce,
  });
}

export function DefaultSelectEntryAsync(props) {
  const { id, element, listElement, label, description, helper, property, state, needsRefresh } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = listElement || getBusinessObject(element);

  const getOptions = () => {
    
    const currValue = genericGetValue({
      helper,
      element,
      listElement,
      property,
      businessObject
    });

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

  const getValue = () => genericGetValue({
    helper,
    element,
    listElement,
    property,
    businessObject
  });

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value,
    },
    businessObject,
    modeling,
    bpmnFactory
  });

  return new SelectEntry({
    id,
    element,
    label,
    description,
    getValue,
    setValue,
    debounce,
    getOptions,
  });
}

export function DefaultToggleSwitchEntry(props) {
  const { id, element, listElement, label, description, helper, property, defaultValue, invert, cleanup, cleanupHelper } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => {
    var value;
    
    if (defaultValue) {
      
      value = genericGetValue({
        helper,
        element,
        listElement,
        property,
        businessObject
      });

      if (!value) {
        genericSetValue({
          helper,
          element,
          listElement,
          values: {
            [property]: defaultValue,
          },
          businessObject,
          modeling,
          bpmnFactory
        });
      }
    }

    return genericGetValue({
      helper,
      element,
      listElement,
      property,
      businessObject
    }) === (invert ? 'false' : 'true');
  };
    
  const setValue = (value) => {
    genericSetValue({
      helper,
      element,
      listElement,
      values: {
        // eslint-disable-next-line no-nested-ternary
        [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'),
      },
      businessObject,
      modeling,
      bpmnFactory
    });

    // special cleanup for toggle switch entries
    if (helper) {
      helper.setProperty({
        element,
        listElement,
        values: {
          ...(cleanup && cleanup(value))
        }
      });
    } else if (cleanupHelper) {
      cleanupHelper.setProperty({
        element,
        listElement,
        values: {
          ...(cleanup && cleanup(value))
        }
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        ...(cleanup && cleanup(value))
      });
    }
  };

  return new ToggleSwitchEntry({
    id,
    element,
    label,
    description,
    getValue,
    setValue,
    debounce,
  });
}

export function DefaultTextAreaEntry(props) {
  const { id, element, listElement, label, description, helper, property, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => genericGetValue({
    helper,
    element,
    listElement,
    property,
    parent,
    businessObject
  });

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value,
    },
    parent,
    businessObject,
    modeling,
    bpmnFactory
  });

  return new TextAreaEntry({
    id,
    element,
    label,
    description,
    getValue,
    setValue,
    debounce,
  });
}

export function DefaultTextAreaEntryWithEditor(props) {
  const { id, element, listElement, label, description, helper, property, language, type, parent } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const businessObject = listElement || getBusinessObject(element);

  const getValue = () => genericGetValue({
    helper,
    element,
    listElement,
    property,
    parent,
    businessObject
  });

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: {
      [property]: value,
    },
    parent,
    businessObject,
    modeling,
    bpmnFactory
  });

  const labelWithIcon =
    OpenDialogLabel(label, () => {
      var getProperty = () => genericGetValue({
        helper,
        element,
        listElement,
        property,
        parent,
        businessObject
      });
      var saveProperty = text => genericSetValue({
        helper,
        element,
        listElement,
        values: {
          [property]: text,
        },
        parent,
        businessObject,
        modeling,
        bpmnFactory
      });
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
      id,
      element,
      label: labelWithIcon,
      description,
      getValue,
      setValue,
      debounce,
    })
  ];
}