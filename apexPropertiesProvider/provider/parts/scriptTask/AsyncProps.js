
import { DefaultToggleSwitchEntry } from '../../helper/templates';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function AsyncProps(args) {
  
  const { element, injector } = args;
  
  const translate = injector.get('translate');
  
  const entries = [];

  if (is(element, 'bpmn:ScriptTask') || is(element, 'bpmn:ServiceTask')) {
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
