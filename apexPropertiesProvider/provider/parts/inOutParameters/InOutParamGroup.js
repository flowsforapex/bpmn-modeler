
import { getBusinessObject } from '../../helper/util';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import InOutParamList from './InOutParamList';

export default function (args) {
  const { element, translate } = args;

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (!businessObject.loopCharacteristics) {
    
    const inputHelper = new ListExtensionHelper(
      {
        listParentType: null,
        listType: 'apex:InputParameters',
        entryType: 'apex:Parameter',
        listAttr: null,
        entryAttr: 'inputParameter',
        entryName: null
      }
    );

    entries.push({
      id: 'inputParameters',
      element,
      label: translate('Input Parameters'),
      component: InOutParamList,
      helper: inputHelper,
    });

    if (!is(element, 'bpmn:StartEvent')) {

      const outputHelper = new ListExtensionHelper(
        {
          listParentType: null,
          listType: 'apex:OutputParameters',
          entryType: 'apex:Parameter',
          listAttr: null,
          entryAttr: 'outputParameter',
          entryName: null
        }
      );
    
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
