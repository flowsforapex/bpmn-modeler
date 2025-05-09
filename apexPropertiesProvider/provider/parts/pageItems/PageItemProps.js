import { isSelectEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
// eslint-disable-next-line import/no-extraneous-dependencies
import { html } from 'htm/preact';
import { DefaultSelectEntryAsync, DefaultTextFieldEntry } from '../../helper/templates';
import { getBusinessObject } from '../../helper/util';
import { getItems } from '../../plugins/metaDataCollector';






export default function PageItemProps(args) {

  const { idPrefix, pageItem, element, helper } = args;

  const businessObject = getBusinessObject(element);

  const translate = useService('translate');

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
        listElement: pageItem,
        helper: helper,
        component: ItemNameProp,
        isEdited: isSelectEntryEdited,
        helper: helper
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

  const {element, id, listElement, helper} = props;

  const translate = useService('translate');

  const [items, setItems] = useState({});

  const applicationId = helper.getExtensionProperty(element, 'applicationId');
  const pageId = helper.getExtensionProperty(element, 'pageId');

  useEffect(() => {
    getItems(applicationId, pageId).then(i => setItems({ values: i, loaded: true, applicationId: applicationId, pageId: pageId }));
  }, [applicationId, pageId]);

  const needsRefresh = (applicationId !== items.applicationId) || (pageId !== items.pageId);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Item')}
    property=itemName
    state=${items}
    needsRefresh=${needsRefresh}
  />`;
}
