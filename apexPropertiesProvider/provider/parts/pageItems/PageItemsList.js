import { CollapsibleEntry, ListEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

// eslint-disable-next-line import/no-extraneous-dependencies
import { html } from 'htm/preact';

import PageItemProps from './PageItemProps';

export default function PageItemsList(args) {
  
  const {element, id, helper, listHelper} = args;

  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');
  const translate = useService('translate');

  const pageItems = listHelper.getSubExtensionElements(element) || [];

  function addItem() {
    listHelper.addSubElement({
        element,
        bpmnFactory,
        modeling,
        newProps: {
          itemName: null,
          itemValue: null,
        }
      }
    );
  }

  function removeItem(pageItem) {
    listHelper.removeSubElement({
      element,
      modeling,
      listElement: pageItem,
    });
  }

  return html`<${ListEntry}
    element=${element}
    id=${id}
    label=${translate('Page Items')}
    items=${pageItems}
    component=${PageItem}
    onAdd=${addItem}
    onRemove=${removeItem}
    helper=${helper}
  />`;
}


function PageItem(props) {
  const {
    element,
    index,
    item: pageItem,
    helper,
    open
  } = props;

  const id = `pageItem-${index}`;

  return html`<${CollapsibleEntry}
    id=${id}
    element=${element}
    entries=${
      PageItemProps({
        idPrefix: id,
        element,
        pageItem,
        helper
      })}
    label=${pageItem.get('itemName') || ''}
    open=${open}
    />`;
}
