import {
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultTextAreaEntry } from '../../helper/templates';

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');
  
  return [
    {
      id: 'instanceName',
      element,
      label: translate('Instance Name'),
      property: 'instanceName',
      component: DefaultTextAreaEntry,
      isEdited: isTextAreaEntryEdited,
    }
  ];
}