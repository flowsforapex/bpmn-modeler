import {
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultTextAreaEntry, DefaultTextFieldEntry } from '../../helper/templates';


export default function TaskProps(args) {
  
  const { element, injector } = args;
  
  const translate = injector.get('translate');
  
  const entries = [];

  entries.push(
    {
      id: 'subject',
      element,
      label: translate('Subject'),
      extensionType: 'apex:Subject',
      property: 'value',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'description',
      element,
      label: translate('Description'),
      extensionType: 'apex:Description',
      property: 'value',
      component: DefaultTextAreaEntry,
      isEdited: isTextAreaEntryEdited,
    },
  );

  return entries;
}
