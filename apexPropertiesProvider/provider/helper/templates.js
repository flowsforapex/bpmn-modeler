import { NumberFieldEntry, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getProperty, updateProperties } from './properties';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import { OpenDialogLabel } from './OpenDialogLabel';

function useContext() {
  const modeling    = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const debounce    = useService('debounceInput');
  const translate   = useService('translate');

  return { modeling, bpmnFactory, debounce, translate };
}

function useValue({ helper, element, listElement, parent }) {
  
  const get = (property) => helper
    ? helper.getProperty({ element, property, listElement, parent })
    : getProperty({ element, listElement, property });

  const set = (values, context) => helper
    ? helper.setProperty({ element, values, listElement, parent, ...context })
    : updateProperties({ element, listElement, values, ...context });

  return { get, set };
}

export function DefaultNumberEntry(props) {
  
  const { id, element, label, description, property } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);

  const value = (v) => { return { [property]: v ? String(v) : v }};

  return NumberFieldEntry({
    id,
    element,
    label,
    description,
    getValue: () => get(property),
    setValue: v => set(value(v), context),
    debounce: context.debounce,
  });
}

export function DefaultTextFieldEntry(props) {
  
  const { id, element, label, description, property } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);

  const value = (v) => { return { [property]: v }};

  return new TextFieldEntry({
    id,
    element,
    label,
    description,
    getValue: () => get(property),
    setValue: v => set(value(v), context),
    debounce: context.debounce,
  });
}

export function DefaultSelectEntry(props) {
  
  const { id, element, label, description, property, defaultValue, options, cleanup } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);
  
  const getValue = () => {
    
    const value = get(property);
    
    // set default value if empty or value not in options
    if (defaultValue && (!value || !options.some(v => v.value === value))) {
      set({ [property]: defaultValue }, context);
      return defaultValue;
    }
    
    return value;
  };

  const value = (v) => { return { [property]: v, ...(cleanup && cleanup(v)) }};

  return new SelectEntry({
    id,
    element,
    label,
    description,
    getValue: getValue,
    setValue: v => set(value(v), context),
    getOptions: () => options,
    debounce: context.debounce,
  });
}

export function DefaultSelectEntryAsync(props) {
  
  const { id, element, label, description, property, state, needsRefresh } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);
  
  const getOptions = () => {
    
    const currValue = get(property);
    
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

  const value = (v) => { return { [property]: v }};

  return new SelectEntry({
    id,
    element,
    label,
    description,
    getValue: () => get(property),
    setValue: v => set(value(v), context),
    debounce: context.debounce,
    getOptions,
  });
}

export function DefaultToggleSwitchEntry(props) {
  
  const { id, element, label, description, property, defaultValue, invert, cleanup } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);

  const stringToBoolean = (v) => { return (v === (invert ? 'false' : 'true'))};

  const booleanToString = (v) => { return (v ? (invert ? 'false' : 'true') : (invert ? 'true' : 'false'))};
  
  const getValue = () => {
    const value = get(property);
    
    // set default value if empty
    if (defaultValue && !value) {
      set({ [property]: defaultValue }, context);
      return stringToBoolean(defaultValue);
    }
    
    return stringToBoolean(value);
  };

  const value = (v) => { return { [property]: booleanToString(v), ...(cleanup && cleanup(value)) }}

  return new ToggleSwitchEntry({
    id,
    element,
    label,
    description,
    getValue: getValue,
    setValue: v => set(value(v), context),
    debounce: context.debounce,
  });
}

export function DefaultTextAreaEntry(props) {
  
  const { id, element, label, description, property } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);

  const value = (v) => { return { [property]: v }};

  return new TextAreaEntry({
    id,
    element,
    label,
    description,
    getValue: () => get(property),
    setValue: v => set(value(v), context),
    debounce: context.debounce,
  });
}

export function DefaultTextAreaEntryWithEditor(props) {
  
  const { id, element, label, description, property, language, type } = props;
  
  const context = useContext();
  const { get, set } = useValue(props);

  const labelWithIcon =
    OpenDialogLabel(label, () => {
      
      var getProperty = () => get(property);
      var saveProperty = text => set({ [property]: text }, context);
      
      openEditor(
        getProperty,
        saveProperty,
        language,
        type,
        id
      );
    });

  const value = (v) => { return { [property]: v }};

  return [
    getContainer(context.translate, id),
    new TextAreaEntry({
      id,
      element,
      label: labelWithIcon,
      description,
      getValue: () => get(property),
      setValue: v => set(value(v), context),
      debounce: context.debounce,
    })
  ];
}