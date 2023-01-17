import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultSelectEntry, DefaultTextFieldEntry } from '../../helper/templates';

export default function ParameterProps(args) {
  const { idPrefix, parameter, element, injector } = args;

  const translate = injector.get('translate');
  
  return [
    {
      id: `${idPrefix}-parStaticId`,
      idPrefix,
      element,
      listElement: parameter,
      label: translate('Static ID'),
      property: 'parStaticId',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-parDataType`,
      idPrefix,
      element,
      listElement: parameter,
      label: translate('Data Type'),
      property: 'parDataType',
      options: [
        { label: translate('String'), value: 'String' }
      ],
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-parValue`,
      idPrefix,
      element,
      listElement: parameter,
      label: translate('Value'),
      property: 'parValue',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}