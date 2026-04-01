import {
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultTextAreaEntry, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { is } from 'bpmn-js/lib/util/ModelUtil';

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

  if (is(element, 'bpmn:ScriptTask')) {
    entries.push(
      {
        id: 'asyncBefore',
        element,
        label: translate('Run Asynchronously Before'),
        extensionType: 'apex:AsyncBefore',
        property: 'value',
        //TODO check: need default?
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'asyncAfter',
        element,
        label: translate('Run Asynchronously After'),
        extensionType: 'apex:AsyncAfter',
        property: 'value',
        //TODO check: need default?
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      }
    )
  }

  return entries;
}
