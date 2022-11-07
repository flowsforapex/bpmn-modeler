import ParameterProps from './ProcVarProps';

import { nextId } from '../../helper/util';

export default function ParametersProps({ element, injector }, helper) {
  const parameters = helper.getSubExtensionElements(element) || [];

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');

  const items = parameters.map((parameter, index) => {
    const id = `${element.id}-procVar-${index}`;

    return {
      id,
      label: parameter.get('varName') || '',
      entries: ParameterProps({
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
        varName: nextId('ProcVar_'),
      }
    ),
  };
}
