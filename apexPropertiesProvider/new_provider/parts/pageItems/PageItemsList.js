import PageItemProps from './PageItemProps';

import { nextId } from '../../helper/util';

export default function PageItemsList({ element, injector }, helper, hooks) {
  const pageItems = helper.getSubExtensionElements(element) || [];

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');

  const items = pageItems.map((pageItem, index) => {
    const id = `${element.id}-pageItem-${index}`;

    return {
      id,
      label: pageItem.get('itemName') || '',
      entries: PageItemProps({
        idPrefix: id,
        element,
        pageItem,
        hooks,
      }),
      autoFocusEntry: `${id}-name`,
      remove: helper.removeSubFactory({
        commandStack,
        element,
        pageItem,
      }),
    };
  });

  return {
    items,
    add: helper.addSubFactory(
      {
        element,
        bpmnFactory,
        commandStack,
      },
      {
        itemName: nextId('PageItem_'),
        itemValue: '',
      }
    ),
  };
}
