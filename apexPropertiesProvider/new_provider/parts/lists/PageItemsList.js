import { getSubExtensionElements } from '../../helper/util';

import ParameterProps from './PageItemProps';

import { addSubFactory, removeSubFactory } from './Factories';

export default function ParametersProps({ element, injector }) {
  const parameters =
    getSubExtensionElements(element, 'apex:ApexPage', 'pageItems', 'pageItem') || [];

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
      remove: removeSubFactory('apex:ApexPage', 'pageItems', 'pageItem', {
        commandStack,
        element,
        parameter,
      }),
    };
  });

  return {
    items,
    add: addSubFactory(
      'apex:ApexPage',
      'apex:PageItems',
      'pageItems',
      'apex:PageItem',
      'pageItem',
      { element, bpmnFactory, commandStack }
    ),
  };
}
