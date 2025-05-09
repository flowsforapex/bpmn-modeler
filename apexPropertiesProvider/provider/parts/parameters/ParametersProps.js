import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { DefaultSelectEntry, DefaultTextFieldEntry } from '../../helper/templates';

export default function ParameterProps(args) {
  
  const { idPrefix, parameter, element } = args;

  const translate = useService('translate');
  
  return [
    {
      id: `${idPrefix}-parStaticId`,
      element,
      listElement: parameter,
      label: translate('Static ID'),
      property: 'parStaticId',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-parDataType`,
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
      element,
      listElement: parameter,
      label: translate('Value'),
      property: 'parValue',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}