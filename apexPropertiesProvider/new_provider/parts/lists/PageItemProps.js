import { TextFieldEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

export default function ParameterProps(props) {
  const { idPrefix, parameter } = props;

  const entries = [
    {
      id: `${idPrefix}-itemName`,
      component: ItemName,
      idPrefix,
      parameter,
    },
    {
      id: `${idPrefix}-itemValue`,
      component: ItemValue,
      idPrefix,
      parameter,
    },
  ];

  return entries;
}

function ItemName(props) {
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

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-itemName`,
    label: translate('Item Name'),
    getValue,
    setValue,
    debounce,
  });
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
