import ParameterProps from './PageItemProps';

export default function ParametersProps({ element, injector }, helper, hooks) {
  const parameters = helper.getSubExtensionElements(element) || [];

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
        hooks,
      }),
      autoFocusEntry: `${id}-name`,
      remove: helper.removeSubFactory({
        commandStack,
        element,
        parameter,
      }),
    };
  });

  return {
    items,
    add: helper.addSubFactory({
      element,
      bpmnFactory,
      commandStack,
    }),
  };
}
