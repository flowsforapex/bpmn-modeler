
import {
  isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';
import { getProperty } from '../../helper/util';

export default function InOutParamProps(args) {
  const { idPrefix, param, element } = args;
  
  const translate = useService('translate');
  
  const entries = [];

  const dataTypeOptions = [
    { label: translate('string'), value: 'string' },
    { label: translate('number'), value: 'number' },
    { label: translate('boolean'), value: 'boolean' },
    { label: translate('array'), value: 'array' },
    { label: translate('object'), value: 'object' },
  ];

  // Basic parameter fields
  entries.push(
    {
      id: `${idPrefix}-name`,
      element,
      listElement: param,
      label: translate('Name'),
      property: 'name',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-type`,
      element,
      listElement: param,
      label: translate('Type'),
      property: 'type',
      options: dataTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-required`,
      element,
      listElement: param,
      label: translate('Required'),
      property: 'required',
      defaultValue: 'false',
      component: DefaultToggleSwitchEntry,
      // isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: `${idPrefix}-description`,
      element,
      listElement: param,
      label: translate('Description'),
      property: 'description',
      component: DefaultTextAreaEntry,
      isEdited: isTextAreaEntryEdited,
    }
  );

  entries.push({
    id: `${idPrefix}-expressionType`,
    element,
    listElement: param,
    label: translate('Expression Type'),
    property: 'source.expressionType',
    options: [
      { label: translate('Static'), value: 'static' },
      { label: translate('User Input'), value: 'userInput' },
      { label: translate('Process Variable'), value: 'processVariable' },
    ],
    cleanup: (value) => {
      return {
        ...(value === 'userInput' && {'source.expression': null}),
      };
    },
    component: DefaultSelectEntry,
    isEdited: isSelectEntryEdited,
  });

  const expressionType = getProperty(element, param, 'source.expressionType');

  if (expressionType === 'processVariable' || expressionType === 'static') {
    entries.push({
      id: `${idPrefix}-expression`,
      element,
      listElement: param,
      label: translate('Expression'),
      property: 'source.expression',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    });
  }

  return entries;
}
