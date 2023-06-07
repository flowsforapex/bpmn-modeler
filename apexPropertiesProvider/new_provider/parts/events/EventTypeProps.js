
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { DefaultSelectEntry } from '../../helper/templates';

import { getMessageEvent } from '../message/SimpleMessageProps';

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const defaultValues = {
    'bpmn:IntermediateThrowEvent': 'simpleMessage',
    'bpmn:IntermediateCatchEvent': 'simpleMessage',
  };

  const selectOptions = {
    'bpmn:IntermediateThrowEvent': [
      { label: translate('Simple Message'), value: 'simpleMessage' },
    ],
    'bpmn:IntermediateCatchEvent': [
      { label: translate('Simple Message'), value: 'simpleMessage' },
    ],
  };

  if (
    (is(element, 'bpmn:IntermediateThrowEvent') && getMessageEvent(element)) ||
    (is(element, 'bpmn:IntermediateCatchEvent') && getMessageEvent(element))
  ) {
    return [
      {
        id: 'eventType',
        element,
        label: translate('Event Type'),
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
  return [];
}