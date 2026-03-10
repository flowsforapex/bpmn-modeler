
import {
  isNumberFieldEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultNumberEntry, DefaultTextAreaEntry, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { isChildOf } from '../../helper/util';

const displayOrderHelper = new ExtensionHelper('apex:DisplayOrder');
const groupingHelper = new ExtensionHelper('apex:Grouping');
const isRepeatableHelper = new ExtensionHelper('apex:IsRepeatable');
const descriptionHelper = new ExtensionHelper('apex:Description');

export default function TaskProps(args) {
  
  const { element, injector } = args;
  
  const translate = injector.get('translate');
  
  const entries = [];
  
  if (isChildOf(element, 'bpmn:AdHocSubProcess')) {
    entries.push(
      {
        id: 'isRepeatable',
        element,
        label: translate('Is Repeatable'),
        property: 'value',
        helper: isRepeatableHelper,
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'displayOrder',
        element,
        label: translate('Display Order'),
        property: 'value',
        helper: displayOrderHelper,
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      },
      {
        id: 'grouping',
        element,
        label: translate('Grouping'),
        property: 'value',
        helper: groupingHelper,
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'description',
        element,
        label: translate('Description'),
        property: 'value',
        helper: descriptionHelper,
        component: DefaultTextAreaEntry,
        isEdited: isTextAreaEntryEdited,
      },
    );
  }

  return entries;
}
