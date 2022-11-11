import { SelectEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';


var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function (element, injector) {
  if (ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask'])) {
    return [
      {
        id: 'taskType',
        element,
        component: TaskType,
        // isEdited: isSelectEntryEdited,
      },
    ];
  }
  return [];
}

function TaskType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const defaultValues = {
    'bpmn:UserTask': 'apexPage',
    'bpmn:ServiceTask': 'executePlsql',
    'bpmn:ScriptTask': 'executePlsql',
    'bpmn:BusinessRuleTask': 'executePlsql'
  };

  const selectOptions = {
    'bpmn:UserTask': [
      { label: translate('APEX Page'), value: 'apexPage' },
      // { label: translate('External URL'), value: 'externalUrl' },
      { label: translate('APEX Approval'), value: 'apexApproval' },
    ],
    'bpmn:serviceTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' },
      { label: translate('Send Mail'), value: 'sendMail' },
    ],
    'bpmn:scriptTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' }
    ],
    'bpmn:businessRuleTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' },
    ],
  };

  const getValue = () => {
    var value = element.businessObject.type;

    var defaultValue = defaultValues[element.type];

    if (typeof value === 'undefined' && typeof defaultValue !== 'undefined') {
      modeling.updateProperties(element, {
        type: defaultValue,
      });
    }

    return element.businessObject.type;
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      type: value,
    });
  };

  const getOptions = () => selectOptions[element.type];

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Task Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: getOptions
  });
}