import PageItemProps from './PageItemProps';

export default function PageItemsList(args) {
  const {element, injector, helper} = args;

  const bpmnFactory = injector.get('bpmnFactory');
  const modeling = injector.get('modeling');

  const pageItems = helper.getSubExtensionElements(element) || [];

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
          pageItem
        },
      ),
      autoFocusEntry: `${id}-name`,
      remove: helper.removeSubFactory({
        element,
        modeling,
        listElement: pageItem,
      }),
    };
  });

  return {
    items,
    add: helper.addSubFactory(
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
