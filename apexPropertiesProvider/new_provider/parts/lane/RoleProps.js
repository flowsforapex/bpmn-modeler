import { isTextFieldEntryEdited, isToggleSwitchEntryEdited } from '@bpmn-io/properties-panel';

import { DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';
import { getBusinessObject } from '../../helper/util';

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');
  
  const entries = [];

  entries.push(
    {
      id: 'isRole',
      element,
      label: translate('Is Role'),
      property: 'isRole',
      defaultValue: 'false',
      component: DefaultToggleSwitchEntry,
      isEdited: isToggleSwitchEntryEdited,
    }
  );

  if (businessObject.isRole) {
    entries.push(
      {
        id: 'role',
        element,
        label: translate('Role'),
        property: 'role',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  }
  
  return entries;
}