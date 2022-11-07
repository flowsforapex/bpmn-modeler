import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

export default function ParameterProps(props) {
  const { idPrefix, parameter, hooks } = props;

  return [
    {
      id: `${idPrefix}-itemName`,
      component: ItemName,
      idPrefix,
      parameter,
      hooks,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-itemNameText`,
      component: ItemNameText,
      idPrefix,
      parameter,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-itemValue`,
      component: ItemValue,
      idPrefix,
      parameter,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function ItemName(props) {
  const { idPrefix, element, parameter } = props;

  const { items, setItems } = props.hooks;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getOptions = (parameter) => {
    const currValue = parameter.itemName;

    const existing =
      currValue == null || items.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...items.map((item) => {
        return {
          label: item.label,
          value: item.value,
        };
      }),
    ];
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        itemName: value,
      },
    });
  };

  const getValue = parameter => parameter.itemName;

  if (element.businessObject.manualInput === 'false') {
    return SelectEntry({
      element: parameter,
      id: `${idPrefix}-itemName`,
      label: translate('Item'),
      getValue,
      setValue,
      debounce,
      getOptions: getOptions,
    });
  }
}

function ItemNameText(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        itemName: value,
      },
    });
  };

  const getValue = parameter => parameter.itemName;

  if (element.businessObject.manualInput === 'true') {
    return TextFieldEntry({
      element: parameter,
      id: `${idPrefix}-itemName`,
      label: translate('Item Name'),
      getValue,
      setValue,
      debounce,
    });
  }
}

function ItemValue(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        itemValue: value,
      },
    });
  };

  const getValue = parameter => parameter.itemValue;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-itemValue`,
    label: translate('Item Value'),
    getValue,
    setValue,
    debounce,
  });
}
