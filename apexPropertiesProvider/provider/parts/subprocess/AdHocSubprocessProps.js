import { useService } from 'bpmn-js-properties-panel';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import { getBusinessObject } from '../../helper/util';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultNumberEntry, DefaultSelectEntry, DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { isNumberFieldEntryEdited, isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import { html } from 'htm/preact';

import { getExtensionValue } from '../../helper/extensions';
import { getApplications, getPages } from '../../plugins/metaDataCollector';

const startingHelper = new ExtensionHelper('apex:StartingActivities');
const completionHelper = new ExtensionHelper('apex:CompletionCondition');

const extensionHelper = new ExtensionHelper('apex:ApexPage');

const listExtensionHelper = new ListExtensionHelper(
  {
    listParentType: 'apex:ApexPage',
    listType: 'apex:PageItems',
    entryType: 'apex:PageItem',
    listAttr: 'pageItems',
    entryAttr: 'pageItem',
    entryName: null
  }
);

export function AdHocSubProcessProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {

    entries.push(
      {
        id: 'subject',
        element,
        label: translate('Subject'),
        extensionType: 'apex:Subject',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'control',
        element,
        label: translate('Control Mode'),
        extensionType: 'apex:Control',
        property: 'value',
        defaultValue: 'manual',
        component: DefaultSelectEntry,
        options: [
          { label: translate('Manual'), value: 'manual' },
          { label: translate('AI'), value: 'ai' },
          { label: translate('Hybrid'), value: 'hybrid' },
          { label: translate('Recommendation'), value: 'recommendation' },
        ],
        isEdited: isSelectEntryEdited,
      }
    );
  }

  return entries;
}

export function AIProps(args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  const control = getExtensionValue(businessObject, 'apex:Control');

  if (is(element, 'bpmn:AdHocSubProcess') && (control === 'ai' || control === 'hybrid' || control === 'recommendation')) {

    entries.push(
      {
        id: 'aiInterface',
        element,
        label: translate('AI Interface'),
        description: translate('UC_AI or APEX_AI'),
        extensionType: 'apex:AiInterface',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'aiService',
        element,
        label: translate('AI Service'),
        description: translate('APEX Static ID'),
        extensionType: 'apex:AiService',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'aiProvider',
        element,
        label: translate('AI Provider'),
        description: translate('e.g. anthropic, openai'),
        extensionType: 'apex:AiProvider',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'aiModel',
        element,
        label: translate('AI Model'),
        description: translate('e.g. claude-sonnet-4-5'),
        extensionType: 'apex:AiModel',
        property: 'value',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'objective',
        element,
        label: translate('AI Objective'),
        extensionType: 'apex:Objective',
        property: 'value',
        component: DefaultTextAreaEntryWithEditor,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'interval',
        element,
        label: translate('Review Interval Seconds'),
        extensionType: 'apex:Interval',
        property: 'value',
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      },
      {
        id: 'turnsPerSession',
        element,
        label: translate('Turns Per Session'),
        extensionType: 'apex:TurnsPerSession',
        property: 'value',
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      },
      {
        id: 'maxTotalTurns',
        element,
        label: translate('Max Total Turns'),
        extensionType: 'apex:MaxTotalTurns',
        property: 'value',
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      },
      {
        id: 'procVarsToSubmit',
        element,
        label: translate('Process Variables To Submit'),
        description: translate('Array of Strings'),
        extensionType: 'apex:ProcVarsToSubmit',
        property: 'value',
        language: 'json',
        component: DefaultTextAreaEntryWithEditor,
        isEdited: isTextAreaEntryEdited,
      },
    );
  }

  return entries;
}

export function StartingProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {
    
    entries.push(
      {
        id: 'expressionType',
        element,
        label: translate('Expression Type'),
        helper: startingHelper,
        property: 'expressionType',
        options: [
          { label: '', value: null },
          { label: translate('Static'), value: 'static' },
          { label: translate('Process Variable (Array)'), value: 'processVariableArray' },
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

    const expressionType = startingHelper.getProperty({element, property: 'expressionType'});
    
    if (expressionType) {
      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: startingHelper,
          property: 'expression',
          component: DefaultTextFieldEntry,
          isEdited: isTextAreaEntryEdited,
        }
      );
    }
  }
  
  return entries;
}

export function CompletionProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {
    
    entries.push(
      {
        id: 'expressionType',
        element,
        label: translate('Condition Type'),
        helper: completionHelper,
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

    const expressionType = completionHelper.getProperty({element, property: 'expressionType'});
  
    const EXPRESSION_DESCRIPTION = {
      plsqlExpression: translate('PL/SQL Expression returning a boolean value'),
      plsqlFunctionBody: translate('PL/SQL Function Body returning a boolean value'),
    };

    const description = EXPRESSION_DESCRIPTION[expressionType];

    // TODO check editor validation
    if (expressionType) {
      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Condition'),
          description: description,
          helper: completionHelper,
          property: 'expression',
          language: 'plsql',
          type: `${expressionType}Boolean`,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        }
      );
    }
  }
  
  return entries;
}

export function VisibilityProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {
    
    entries.push(
      {
        id: 'taskVisibility',
        element,
        label: translate('Task List Visibility'),
        extensionType: 'apex:TaskVisibility',
        property: 'value',
        defaultValue: 'all',
        options: [
          { label: translate('None'), value: 'none' },
          { label: translate('Sub Process'), value: 'subprocess' },
          { label: translate('Activities'), value: 'activities' },
          { label: translate('All'), value: 'all' },
        ],
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );
  }
  
  return entries;
}

export function DetailPageProps(args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  const visibility = getExtensionValue(businessObject, 'apex:TaskVisibility');

  if (is(element, 'bpmn:AdHocSubProcess') && (!visibility || visibility === 'subprocess' || visibility === 'all')) {

    const manualInput = businessObject.manualInput === 'true';

    entries.push(
      {
        id: 'inputSelection1',
        element,
        label: translate('Use APEX meta data'),
        property: 'manualInput',
        defaultValue: 'false',
        invert: true,
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      }
    );
    
    if (manualInput) {
      entries.push(
        {
          id: 'applicationIdText',
          element,
          label: translate('Application ID'),
          helper: extensionHelper,
          property: 'applicationId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'pageIdText',
          element,
          label: translate('Page ID'),
          helper: extensionHelper,
          property: 'pageId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
      );
    } else {
      entries.push(
        {
          id: 'applicationId',
          element,
          component: ApplicationProp,
          isEdited: isSelectEntryEdited
        },
        {
          id: 'pageId',
          element,
          component: PageProp,
          isEdited: isSelectEntryEdited,
        },
      );
    }
    
    entries.push(
      {
        element,
        component: QuickpickItems,
      },
      {
        id: 'pageItems',
        element,
        component: PageItemsList,
        helper: extensionHelper,
        listHelper: listExtensionHelper,
      }
    );

    entries.push(
        {
          id: 'request',
          element,
          label: translate('Request'),
          description: translate('Request Value for Page Call'),
          helper: extensionHelper,
          property: 'request',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'cache',
          element,
          label: translate('Clear Cache'),
          description: translate('Clear Cache Value for Page Call'),
          helper: extensionHelper,
          property: 'cache',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
      );
  }
  return entries;
}

function ApplicationProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [applications, setApplications] = useState({});

  useEffect(() => {
    getApplications().then(a => setApplications({ values: a, loaded: true }));
  }, []);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Application')}
    helper=${extensionHelper}
    property=applicationId
    state=${applications}
  />`;
}

function PageProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [pages, setPages] = useState({});

  const applicationId = extensionHelper.getProperty({element, property: 'applicationId'});

  useEffect(() => {
    getPages(applicationId).then(p => setPages({ values: p, loaded: true, applicationId: applicationId }));
  }, [applicationId]);

  const needsRefresh = applicationId !== pages.applicationId;

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Page')}
    helper=${extensionHelper}
    property=pageId
    state=${pages}
    needsRefresh=${needsRefresh}
  />`;
}

function QuickpickItems(props) {
  const { element } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  return Quickpick(
    {
      text: translate('Generate default items'),
      handler: () => {
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'PROCESS_ID',
            itemValue: '&F4A$PROCESS_ID.',
          }
        });
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'SUBFLOW_ID',
            itemValue: '&F4A$SUBFLOW_ID.',
          }
        });
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'STEP_KEY',
            itemValue: '&F4A$STEP_KEY.',
          }
        });
      }
    }
  );
}
