import { isTextFieldEntryEdited, isToggleSwitchEntryEdited } from '@bpmn-io/properties-panel';

import { DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');
  
  return [
    {
      id: 'isRole',
      element,
      label: translate('Is Role'),
      property: 'isRole',
      defaultValue: 'false',
      component: DefaultToggleSwitchEntry,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'role',
      element,
      label: translate('Role'),
      property: 'role',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}