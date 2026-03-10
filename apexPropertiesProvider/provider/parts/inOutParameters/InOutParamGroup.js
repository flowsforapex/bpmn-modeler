
import { getBusinessObject } from '../../helper/util';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import InOutParamList from './InOutParamList';

var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

export default function (args) {
  const { element, translate } = args;

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (!businessObject.loopCharacteristics) {
    if (
      ModelingUtil.isAny(element, ['bpmn:Task', 'bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:ManualTask', 'bpmn:CallActivity'])
    ) {

      const inputHelper = new ListExtensionHelper(
        'apex:InputParameters',
        null,
        'inputParameters',
        'apex:Parameter',
        null,
        'InputParameter'
      );

      const outputHelper = new ListExtensionHelper(
        'apex:OutputParameters',
        null,
        'outputParameters',
        'apex:Parameter',
        null,
        'OutputParameter'
      );

      entries.push({
        id: 'inputParameters',
        element,
        label: translate('Input Parameters'),
        component: InOutParamList,
        helper: inputHelper,
      });

      entries.push({
        id: 'outputParameters',
        element,
        label: translate('Output Parameters'),
        component: InOutParamList,
        helper: outputHelper,
      });
    }
  }

  return entries;
}
