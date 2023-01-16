import { SelectEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil');
var minDash = require('min-dash');

function getTerminateEventDefinition(element) {
  const businessObject = getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];

  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, 'bpmn:TerminateEventDefinition');
  });
}

export default function (args) {

  const {element} = args;

  const terminateEventDefinition = getTerminateEventDefinition(element);
  
  if (terminateEventDefinition) {
    return [
      {
        id: 'processStatus',
        element,
        component: ProcessStatus,
        // isEdited: isNumberFieldEntryEdited,
      },
    ];
  }
  return [];
}

export function ProcessStatus(props) {
  const { id, element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const terminateEventDefinition = getTerminateEventDefinition(element);

  const getValue = () => {
    const value = terminateEventDefinition.get('processStatus');

    if (!value) {
      modeling.updateModdleProperties(element, terminateEventDefinition, {
        processStatus: 'completed',
      });
    }

    return terminateEventDefinition.get('processStatus');
  };

  const setValue = (value) => {
    modeling.updateModdleProperties(element, terminateEventDefinition, {
      processStatus: value,
    });
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Process status after termination'),
    getValue: getValue,
    setValue: setValue,
    getOptions: () => [
      { label: translate('Completed'), value: 'completed' },
      { label: translate('Terminated'), value: 'terminated' },
    ],
    debounce: debounce,
  });
}