import PageItemProps from './PageItemProps';

export default function PageItemsList(args) {
  const {element, injector, helper, listHelper} = args;

  const bpmnFactory = injector.get('bpmnFactory');
  const modeling = injector.get('modeling');

  const pageItems = listHelper.getSubExtensionElements(element) || [];

  const items = pageItems.map((pageItem, index) => {
    const id = `pageItem-${index}`;

    return {
      id,
      label: pageItem.get('itemName') || '',
      entries: PageItemProps(
        {
          idPrefix: id,
          element,
          injector,
          pageItem,
          helper
        },
      ),
      autoFocusEntry: `${id}-name`,
      remove: listHelper.removeSubFactory({
        element,
        modeling,
        listElement: pageItem,
      }),
    };
  });

  return {
    items,
    add: listHelper.addSubFactory(
      {
        element,
        bpmnFactory,
        modeling,
        newProps: {
          itemName: null,
          itemValue: null,
        }
      }
    ),
  };
}
