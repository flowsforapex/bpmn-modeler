import { useService } from 'bpmn-js-properties-panel';

import { CollapsibleEntry, ListEntry } from '@bpmn-io/properties-panel';

import { html } from 'htm/preact/index.js';

import ParametersProps from './ParametersProps';

export default function ParametersList(args) {
  const {element, id, helper} = args;

  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');
  const translate = useService('translate');
  
  const parameters = helper.getSubExtensionElements(element) || [];

  function addParameter() {
    helper.addSubElement({
        element,
        bpmnFactory,
        modeling,
        newProps: {
          parStaticId: null,
          parDataType: 'String',
          parValue: null,
        }
      }
    );
  }

  function removeParameter(parameter) {
    listHelper.removeSubElement({
      element,
      modeling,
      listElement: parameter,
    });
  }

  return html`<${ListEntry}
    element=${element}
    id=${id}
    label=${translate('Parameters')}
    items=${parameters}
    component=${Parameter}
    onAdd=${addParameter}
    onRemove=${removeParameter}
    helper=${helper}
  />`;
}


function Parameter(props) {
  const {
    element,
    index,
    item: parameter,
    helper
  } = props;

  const id = `parameter-${index}`;

  return html`<${CollapsibleEntry}
    id=${id}
    element=${element}
    entries=${
      ParametersProps({
        idPrefix: id,
        element,
        parameter,
        helper
      })}
    label=${parameter.get('parStaticId') || ''}
    />`;
}
