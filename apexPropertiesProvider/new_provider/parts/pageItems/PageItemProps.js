import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

import { getItems } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexPage');

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
        element,
        component: ItemNameProp,
        isEdited: isSelectEntryEdited,
      }
    );
  }

  entries.push(
    {
      id: `${idPrefix}-itemValue`,
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

function ItemNameProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [items, setItems] = useState([]);

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');
  const pageId = extensionHelper.getExtensionProperty(element, 'pageId');

  useEffect(() => {
    function fetchItems() {
      getItems(applicationId, pageId).then(i => setItems(i));
    }

    fetchItems();
  }, [setItems, applicationId, pageId]);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Item')}
    property=${'itemName'}
    state=${items}
  />`;
}