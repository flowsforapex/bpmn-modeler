import {
  isToggleSwitchEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultToggleSwitchEntry } from '../../helper/templates';

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');
  
  return [
    {
      id: 'isCallable',
      element,
      label: translate('Is Callable'),
      description: translate('Select if this diagram should be called in a Call Activity'),
      property: 'isCallable',
      // defaultValue: 'false', // TODO default value not working in APEX atm
      component: DefaultToggleSwitchEntry,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'isStartable',
      element,
      label: translate('Is Startable'),
      description: translate('Select if this diagram is startable'),
      property: 'isStartable',
      // defaultValue: 'false', // TODO default value not working in APEX atm
      component: DefaultToggleSwitchEntry,
      isEdited: isToggleSwitchEntryEdited,
    }
  ];
}