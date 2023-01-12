import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

export default function PageItemProps(props) {
  const { idPrefix, pageItem, hooks } = props;

  return [
    {
      id: `${idPrefix}-itemName`,
      component: ItemName,
      idPrefix,
      pageItem,
      hooks,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-itemNameText`,
      component: ItemNameText,
      idPrefix,
      pageItem,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-itemValue`,
      component: ItemValue,
      idPrefix,
      pageItem,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function ItemName(props) {
  const { idPrefix, element, pageItem } = props;

  const { items, setItems } = props.hooks;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const getOptions = (pageItem) => {
    const currValue = pageItem.itemName;

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
    modeling.updateModdleProperties(element, pageItem, {
      itemName: value,
    });
  };

  const getValue = pageItem => pageItem.itemName;

  if (element.businessObject.manualInput === 'false') {
    return SelectEntry({
      element: pageItem,
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
  const { idPrefix, element, pageItem } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, pageItem, {
      itemName: value,
    });
  };

  const getValue = pageItem => pageItem.itemName;

  if (element.businessObject.manualInput === 'true') {
    return TextFieldEntry({
      element: pageItem,
      id: `${idPrefix}-itemName`,
      label: translate('Item Name'),
      getValue,
      setValue,
      debounce,
    });
  }
}

function ItemValue(props) {
  const { idPrefix, element, pageItem } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, pageItem, {
      itemValue: value,
    });
  };

  const getValue = pageItem => pageItem.itemValue;

  return TextFieldEntry({
    element: pageItem,
    id: `${idPrefix}-itemValue`,
    label: translate('Item Value'),
    getValue,
    setValue,
    debounce,
  });
}
