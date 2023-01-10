import ProcVarProps from './ProcVarProps';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function ParametersProps(element, injector, helper) {
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

  const isDefinition = ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant']);

  return {
    items,
    add: helper.addSubFactory(
      {
        element,
        bpmnFactory,
        commandStack,
      },
      {
        ...(!isDefinition && {varSequence: helper.getNextSequence(element)}),
        varName: helper.getNextName(element),
        varDataType: 'VARCHAR2',
        ...(!isDefinition && {varExpressionType: 'static'}),
      }
    ),
  };
}
