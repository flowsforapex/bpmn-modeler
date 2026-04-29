import { NumberFieldEntry, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getProperty, updateProperties } from './properties';

import { getContainer, openEditor } from '../plugins/monacoEditor';
import ExtensionHelper from './ExtensionHelper';
import { OpenDialogLabel } from './OpenDialogLabel';

// helper function to bundle all needed service hooks
function useContext() {
  const modeling    = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const debounce    = useService('debounceInput');
  const translate   = useService('translate');

  return { modeling, bpmnFactory, debounce, translate };
}

// helper function to use either helper or default getter/setter based on props
function useValue({ helper, extensionType, element, listElement, parent }) {
  
  // use passed helper or generate baseed on extensionType (single tag extensions)
  const resolvedHelper = helper || extensionType && new ExtensionHelper(extensionType);
  
  const get = (property) => resolvedHelper
    ? resolvedHelper.getProperty({ element, property, listElement, parent })
    : getProperty({ element, listElement, property });

  const set = (values, context) => resolvedHelper
    ? resolvedHelper.setProperty({ element, values, listElement, parent, ...context })
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

  // conversion between string and boolean values
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

  // append label with clickable icon
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