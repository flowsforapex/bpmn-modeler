import {
  isNumberFieldEntryEdited,
  isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultNumberEntry, DefaultSelectEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { isChildOf } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

const conditionHelper = new ExtensionHelper('apex:StartCondition');

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
        extensionType: 'apex:IsRepeatable',
        property: 'value',
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'displayOrder',
        element,
        label: translate('Display Order'),
        extensionType: 'apex:DisplayOrder',
        property: 'value',
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      },
      {
        id: 'grouping',
        element,
        label: translate('Grouping'),
        extensionType: 'apex:Grouping',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
    );

    entries.push(
      {
        id: 'expressionType',
        element,
        label: translate('Start Condition Type'),
        helper: conditionHelper,
        property: 'expressionType',
        options: [
          { label: '', value: null },
          { label: translate('Expression'), value: 'plsqlExpression' },
          { label: translate('Function Body'), value: 'plsqlFunctionBody' },
        ],
        cleanup: (value) => {
          return {
            ...(!value && {expression: null}),
          };
        },
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );

    const expressionType = conditionHelper.getProperty({element, property: 'expressionType'});
    
    if (expressionType) {
      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Start Condition'),
          helper: conditionHelper,
          property: 'expression',
          language: 'plsql',
          type: `${expressionType}Boolean`, // TODO check editor validation
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        }
      );
    }
  }

  return entries;
}
