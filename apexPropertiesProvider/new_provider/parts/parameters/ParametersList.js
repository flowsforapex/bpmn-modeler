import ParameterProps from './ParametersProps';


export default function ParametersProps(args) {
  const {element, injector, helper} = args;

  const bpmnFactory = injector.get('bpmnFactory');
  const modeling = injector.get('modeling');
  
  const parameters = helper.getSubExtensionElements(element) || [];

  const items = parameters.map((parameter, index) => {
    const id = `parameter-${index}`;

    return {
      id,
      label: parameter.get('parStaticId') || '',
      entries: ParameterProps(
        {
          idPrefix: id,
          element,
          injector,
          parameter
        }
      ),
      autoFocusEntry: `${id}-name`,
      remove: helper.removeSubFactory({
        element,
        modeling,
        listElement: parameter,
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
          parStaticId: null,
          parDataType: 'String',
          parValue: null,
        }
      }
    ),
  };
}
