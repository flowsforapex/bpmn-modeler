import { NumberFieldEntry, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject, getProperty, updateProperties } from './util';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';


const genericGetValue = ({ helper, element, businessObject, property, listElement, parent } = {}) => {
  if (helper) {
    return helper.getProperty({ element, property, listElement, parent });
  }
  return getProperty(element, businessObject, property);
};

const genericSetValue = ({ helper, element, businessObject, values, listElement, parent, context } = {}) => {
  
  const { modeling, bpmnFactory } = context;
  
  if (helper) {
    helper.setProperty({ element, values, listElement, parent, modeling, bpmnFactory });
  } else {
    updateProperties(element, businessObject, values, modeling, bpmnFactory);
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
    values: { [property]: value ? String(value) : value },
    businessObject,
    context: { modeling, bpmnFactory }
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
    values: { [property]: value },
    parent,
    businessObject,
    context: { modeling, bpmnFactory }
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
    
    const value = genericGetValue({
      helper,
      element,
      listElement,
      property,
      parent,
      businessObject
    });
    
    // set default value if empty or value not in options
    if (defaultValue && (!value || !options.some(v => v.value === value))) {
      genericSetValue({
        helper,
        element,
        listElement,
        values: { [property]: defaultValue },
        parent,
        businessObject,
        context: { modeling, bpmnFactory }
      });
      return defaultValue;
    }
    
    return value;
  };

  const setValue = value => genericSetValue({
    helper,
    element,
    listElement,
    values: { [property]: value, ...(cleanup && cleanup(value)) },
    parent,
    businessObject,
    context: { modeling, bpmnFactory }
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
    
    const existing = currValue == null || (state && state.values && state.values.map(e => e.value).includes(currValue));
   
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
    values: { [property]: value },
    businessObject,
    context: { modeling, bpmnFactory }
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
    const value = genericGetValue({
      helper,
      element,
      listElement,
      property,
      businessObject
    });
    
    // set default value if empty
    if (defaultValue && !value) {
      genericSetValue({
        helper,
        element,
        listElement,
        values: {
          [property]: defaultValue,
        },
        businessObject,
        context: { modeling, bpmnFactory }
      });
      return defaultValue === (invert ? 'false' : 'true');
    }
    
    return value === (invert ? 'false' : 'true');
  };

  const setValue = (value) => {
    genericSetValue({
      helper,
      element,
      listElement,
      values: { [property]: value ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false') },
      businessObject,
      context: { modeling, bpmnFactory }
    });

    // special cleanup for toggle switch entries
    if (helper) {
      helper.setProperty({
        element,
        listElement,
        values: { ...(cleanup && cleanup(value)) },
        businessObject,
        modeling,
        bpmnFactory
      });
    } else if (cleanupHelper) {
      cleanupHelper.setProperty({
        element,
        listElement,
        values: { ...(cleanup && cleanup(value)) },
        businessObject,
        modeling,
        bpmnFactory
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, { ...(cleanup && cleanup(value)) });
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
    values: { [property]: value },
    parent,
    businessObject,
    context: { modeling, bpmnFactory }
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
    values: { [property]: value },
    parent,
    businessObject,
    context: { modeling, bpmnFactory }
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
        values: { [property]: text },
        parent,
        businessObject,
        context: { modeling, bpmnFactory }
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