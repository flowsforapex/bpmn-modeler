import ParameterProps from './PageItemProps';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexPage',
  'apex:PageItems',
  'pageItems',
  'apex:PageItem',
  'pageItem'
);

export default function ParametersProps({ element, injector }) {
  const parameters = listExtensionHelper.getSubExtensionElements(element) || [];

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');

  const items = parameters.map((parameter, index) => {
    const id = `${element.id}-parameter-${index}`;

    return {
      id,
      label: parameter.get('itemName') || '',
      entries: ParameterProps({
        idPrefix: id,
        element,
        parameter,
      }),
      autoFocusEntry: `${id}-name`,
      remove: listExtensionHelper.removeSubFactory({
        commandStack,
        element,
        parameter,
      }),
    };
  });

  return {
    items,
    add: listExtensionHelper.addSubFactory({
      element,
      bpmnFactory,
      commandStack,
    }),
  };
}
