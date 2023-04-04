import {
  isTextAreaEntryEdited, isToggleSwitchEntryEdited
} from '@bpmn-io/properties-panel';

import { getBusinessObject } from '../../helper/util';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry } from '../../helper/templates';

var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');

const extensionHelper = new ExtensionHelper('apex:ExecutePlsql');

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];
  
  if (
    is(element, 'bpmn:ScriptTask') ||
    (is(element, 'bpmn:ServiceTask') && !['sendMail'].includes(businessObject.type)) ||
    is(element, 'bpmn:BusinessRuleTask') ||
    (is(element, 'bpmn:SendTask') && businessObject.type === 'executePlsql') ||
    (is(element, 'bpmn:ReceiveTask') && businessObject.type === 'executePlsql')
   ) {
    entries.push(
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
        label: translate('Allow Binding'),
        helper: extensionHelper,
        property: 'engine',
        component: DefaultToggleSwitchEntry,
        isEdited: isToggleSwitchEntryEdited,
      }
    );

    const allowBinds = extensionHelper.getExtensionProperty(element, 'engine');

    if (allowBinds === 'true') {
      entries.push(
        {
          id: 'autoBinds',
          element,
          label: translate('Bind parameter values'),
          description:
              jsxRuntime.jsx('a', {
                children: translate('Documentation'),
                href: 'https://flowsforapex.org/latest/tasks/#3-bpmnscripttask---runs-a-plsql-script',
                target: '_blank'
              }),
          helper: extensionHelper,
          property: 'autoBinds',
          defaultValue: 'false',
          options: [
            { label: translate('Bind process variables'), value: 'false' },
            { label: translate('Bind page items (deprecated)'), value: 'true' },
          ],
          component: DefaultSelectEntry,
          isEdited: isToggleSwitchEntryEdited,
        },
      );
    }
  }
  return entries;
}