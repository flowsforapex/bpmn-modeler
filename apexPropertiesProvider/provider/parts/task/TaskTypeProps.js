
import { DefaultSelectEntry } from '../../helper/templates';

export default function (args) {

  const {element, injector, elementTemplates} = args;

  const translate = injector.get('translate');

  const defaultValues = {
    'bpmn:UserTask': 'apexPage',
    'bpmn:ServiceTask': 'executePlsql',
    'bpmn:ScriptTask': 'executePlsql',
    'bpmn:BusinessRuleTask': 'executePlsql',
    'bpmn:SendTask': 'simpleMessage',
    'bpmn:ReceiveTask': 'simpleMessage'
  };

  const selectOptions = {
    'bpmn:UserTask': [
      { label: translate('APEX Page'), value: 'apexPage' },
      { label: translate('APEX Human Task'), value: 'apexApproval' },
      { label: translate('APEX Simple Form'), value: 'apexSimpleForm' },
    ],
    'bpmn:ServiceTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' },
      { label: translate('Send Mail'), value: 'sendMail' },
      { label: translate('APEX AI Generation'), value: 'apexAIGeneration' },
    ],
    'bpmn:ScriptTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' }
    ],
    'bpmn:BusinessRuleTask': [
      { label: translate('Execute PL/SQL'), value: 'executePlsql' },
    ],
    'bpmn:SendTask': [
      { label: translate('Simple Message'), value: 'simpleMessage' },
      { label: translate('Execute PL/SQL'), value: 'executePlsql' },
    ],
    'bpmn:ReceiveTask': [
      { label: translate('Simple Message'), value: 'simpleMessage' },
    ],
  };

  const typesWithTemplates = [...new Set(elementTemplates.flatMap(t => t.appliesTo))];

  typesWithTemplates.forEach(t => selectOptions[t] && selectOptions[t].push({ label: translate('Template'), value: 'template' }));
  
  return [
    {
      id: 'taskType',
      element,
      label: translate('Task Type'),
      property: 'type',
      defaultValue: defaultValues[element.type],
      options: selectOptions[element.type],
      cleanup: (value) => {
        return {
                ...(!selectOptions[element.type].some(v => v.value === value) && {type: null})
              }; 
        },
      component: DefaultSelectEntry,
      // isEdited: isSelectEntryEdited,
    },
  ];
}