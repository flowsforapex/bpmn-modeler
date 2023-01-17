import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { getBusinessObject } from '../../helper/util';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry } from '../../helper/templates';

export default function PageItemProps(args) {
  const { idPrefix, pageItem, state, element, injector } = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  const manualInput = businessObject.manualInput === 'true';

  if (manualInput) {
    entries.push(
      {
        id: `${idPrefix}-itemNameText`,
        idPrefix,
        element,
        listElement: pageItem,
        label: translate('Item Name'),
        property: 'itemName',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  } else {
    entries.push(
      {
        id: `${idPrefix}-itemName`,
        idPrefix,
        element,
        listElement: pageItem,
        label: translate('Item'),
        property: 'itemName',
        state,
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      }
    );
  }

  entries.push(
    {
      id: `${idPrefix}-itemValue`,
      idPrefix,
      element,
      listElement: pageItem,
      label: translate('Item Value'),
      property: 'itemValue',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
  );

  return entries;
}