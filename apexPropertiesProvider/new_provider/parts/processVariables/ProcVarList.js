import ProcVarProps from './ProcVarProps';

var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

export default function ParametersProps(args) {

  const {element, injector, helper} = args;

  const bpmnFactory = injector.get('bpmnFactory');
  const modeling = injector.get('modeling');
  
  const procVars = helper.getSubExtensionElements(element) || [];

  const isDefinition = ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant']);

  const items = procVars.map((procVar, index) => {
    const id = `procVar-${index}`;

    return {
      id,
      label: isDefinition ? procVar.get('varName') : `${procVar.get('varSequence')} - ${procVar.get('varName')}` || '',
      entries: ProcVarProps({
        idPrefix: id,
        element,
        injector,
        procVar,
      }),
      autoFocusEntry: `${id}-name`,
      remove: helper.removeSubFactory({
        element,
        modeling,
        listElement: procVar,
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
          ...(!isDefinition && {varSequence: helper.getNextSequence(element)}),
          varName: helper.getNextName(element),
          varDataType: 'VARCHAR2',
          ...(!isDefinition && {varExpressionType: 'static'}),
        }
      }
    ),
  };
}
