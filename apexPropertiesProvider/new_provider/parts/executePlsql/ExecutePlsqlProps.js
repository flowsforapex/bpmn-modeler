import {
  isTextAreaEntryEdited, isToggleSwitchEntryEdited
} from '@bpmn-io/properties-panel';

import { getBusinessObject } from '../../helper/util';

import { is } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry } from '../../helper/templates';

const extensionHelper = new ExtensionHelper('apex:ExecutePlsql');

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');
  
  if (
    is(element, 'bpmn:ScriptTask') ||
    (is(element, 'bpmn:ServiceTask') && !['sendMail'].includes(businessObject.type)) ||
    is(element, 'bpmn:BusinessRuleTask') ||
    is(element, 'bpmn:SendTask') ||
    is(element, 'bpmn:ReceiveTask')
   ) {
    return [
      {
        id: 'plsqlCode',
        element,
        label: translate('PL/SQL Code'),
        description: translate('Enter the PL/SQL code to be executed.'),
        helper: extensionHelper,
        property: 'plsqlCode',
        language: 'plsql',
        type: 'plsqlProcess',
        component: DefaultTextAreaEntryWithEditor,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'engine',
        element,
        label: translate('Use APEX_EXEC'),
        helper: extensionHelper,
        property: 'engine',
        component: DefaultToggleSwitchEntry,
        isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'autoBinds',
        element,
        label: translate('Bind Page Item Values (depr)'),
        description: translate('Enable automatic parameter binding of APEX Page Items. Set to Yes if you only reference APEX Page Items.'),
        helper: extensionHelper,
        property: 'autoBinds',
        component: DefaultToggleSwitchEntry,
        isEdited: isToggleSwitchEntryEdited,
      },
    ];
  }
  return [];
}