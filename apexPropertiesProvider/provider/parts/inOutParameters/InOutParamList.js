import { CollapsibleEntry, ListEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

// eslint-disable-next-line import/no-extraneous-dependencies
import { html } from 'htm/preact/index.js';

import InOutParamProps from './InOutParamProps';

export default function InOutParamList(args) {

  const {element, id, label, helper} = args;

  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');
  
  const params = helper.getSubExtensionElements(element) || [];

  function addParam() {
    return helper.addSubElement({
        element,
        bpmnFactory,
        modeling,
        newProps: {
          name: helper.getNextName(element),
          'source.expressionType': 'static',
        }
      }
    );
  }

  function removeParam(param) {
    helper.removeSubElement({
      element,
      modeling,
      listElement: param,
    });
  }

  return html`<${ListEntry}
    element=${element}
    id=${id}
    label=${label}
    items=${params}
    component=${Param}
    onAdd=${addParam}
    onRemove=${removeParam}
    helper=${helper}
  />`;
}


function Param(props) {
  const {
    element,
    index,
    item: param,
    helper,
    open
  } = props;

  const id = `param-${index}`;

  return html`<${CollapsibleEntry}
    id=${id}
    element=${element}
    entries=${
      InOutParamProps({
        idPrefix: id,
        param,
        element,
        helper
      })}
    label=${param.get('name')}
    open=${open}
    />`;
}
