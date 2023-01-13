import {
  isTextAreaEntryEdited, isToggleSwitchEntryEdited
} from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry } from '../../helper/templates';

const extensionHelper = new ExtensionHelper('apex:ExecutePlsql');

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');
  
  if (element.businessObject.type === 'executePlsql' || typeof element.businessObject.type === 'undefined') {
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