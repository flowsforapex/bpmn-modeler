import ProcVarProps from './ProcVarProps';

import { CollapsibleEntry, ListEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';
import { html } from 'htm/preact/index.js';

var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

export default function ParametersProps(args) {

  const {element, id, helper} = args;

  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');
  const translate = useService('translate');
  
  const procVars = helper.getSubExtensionElements(element) || [];

  const isDefinition = ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant']);

  function addProcVar() {
    return helper.addSubElement({
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
    );
  }

  function removeProcVar(procVar) {
    helper.removeSubElement({
      element,
      modeling,
      listElement: procVar,
    });
  }

  return html`<${ListEntry}
    element=${element}
    id=${id}
    label=${translate('Page Items')}
    items=${procVars}
    component=${ProcVar}
    onAdd=${addProcVar}
    onRemove=${removeProcVar}
    helper=${helper}
  />`;
}


function ProcVar(props) {
  const {
    element,
    index,
    item: procVar,
    helper,
  } = props;

  const isDefinition = ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant']);

  const id = `procVar-${index}`;

  return html`<${CollapsibleEntry}
    id=${id}
    element=${element}
    entries=${
      ProcVarProps({
        idPrefix: id,
        element,
        procVar,
        helper
      })}
    label=${isDefinition ? procVar.get('varName') : `${procVar.get('varSequence')} - ${procVar.get('varName')}` || ''}
    />`;
}