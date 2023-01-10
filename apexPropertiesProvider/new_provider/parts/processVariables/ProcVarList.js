import ProcVarProps from './ProcVarProps';

export default function ParametersProps({ element, injector }, helper) {
  const parameters = helper.getSubExtensionElements(element) || [];

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');

  const items = parameters.map((parameter, index) => {
    const id = `${element.id}-procVar-${index}`;

    return {
      id,
      label: `${parameter.get('varSequence')} - ${parameter.get('varName')}` || '',
      entries: ProcVarProps({
        idPrefix: id,
        element,
        parameter,
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
    add: helper.addSubFactory(
      {
        element,
        bpmnFactory,
        commandStack,
      },
      {
        // varName: nextId('ProcVar_'),
        varName: helper.getNextName(element),
        varSequence: helper.getNextSequence(element),
        varDataType: 'VARCHAR2',
        varExpressionType: 'static',
      }
    ),
  };
}
