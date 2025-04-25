import {
  isSelectEntryEdited,
  isToggleSwitchEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultSelectEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

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
    },
    {
      id: 'minLoggingLevel',
      element,
      label: translate('Logging'),
      description: translate('Minimum logging level on execution'),
      property: 'minLoggingLevel',
      defaultValue: '0',
      options: [
        { label: translate('None (0)'), value: '0' },
        { label: translate('Abnormal Events (1)'), value: '1' },
        { label: translate('Major Events (2)'), value: '2' },
        { label: translate('Routine (4)'), value: '4' },
        { label: translate('Detailed (6)'), value: '6' },
        { label: translate('Full (8)'), value: '8' },
      ],
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
  ];
}