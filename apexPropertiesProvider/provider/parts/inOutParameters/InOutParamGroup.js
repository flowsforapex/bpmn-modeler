
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject, isChildOf } from '../../helper/util';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import InOutParamList from './InOutParamList';

import { Quickpick } from '../../helper/Quickpick';

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

    console.log(businessObject.type)

    if (!is(element, 'bpmn:StartEvent') && !(is(element, 'bpmn:UserTask') && businessObject.type === 'apexAutoForm')) {

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
      
      if (isChildOf(element, 'bpmn:AdHocSubProcess'))  {
        entries.push({
          element,
          helper: outputHelper,
          component: QuickpickOutput,
        });
      }

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

function QuickpickOutput(props) {
  const { element, helper } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  return Quickpick(
    {
      text: translate('Generate default parameters'),
      handler: () => {
        helper.addSubElement({
          element,
          bpmnFactory,
          modeling,
          newProps: {
            name: 'result',
            type: 'string',
          }
        });
        helper.addSubElement({
          element,
          bpmnFactory,
          modeling,
          newProps: {
            name: 'keyOutputs',
            type: 'object',
          }
        });
      }
    }
  );
}