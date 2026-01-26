import { useService } from 'bpmn-js-properties-panel';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import { getBusinessObject } from '../../helper/util';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntry, DefaultSelectEntryAsync, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

// eslint-disable-next-line import/no-extraneous-dependencies
import { html } from 'htm/preact';

import { getApplications, getPages } from '../../plugins/metaDataCollector';

const startingHelper = new ExtensionHelper('apex:StartingActivities');
const completionHelper = new ExtensionHelper('apex:CompletionCondition');
const visibilityHelper = new ExtensionHelper('apex:TaskVisibility');

const extensionHelper = new ExtensionHelper('apex:ApexPage');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexPage',
  'apex:PageItems',
  'pageItems',
  'apex:PageItem',
  'pageItem'
);

export function StartingProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {
    
    const expressionTypeOptions = [
      { label: '', value: null },
      { label: translate('Static'), value: 'static' },
      { label: translate('Process Variable (Array)'), value: 'processVariableArray' },
    ];

    const expressionType = startingHelper.getExtensionProperty(element, 'expressionType');

    entries.push(
      {
        id: 'expressionType',
        element,
        label: translate('Expression Type'),
        helper: startingHelper,
        property: 'expressionType',
        options: expressionTypeOptions,
        cleanup: (value) => {
          return {
            ...(!value && {expression: null}),
          };
        },
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );

    if (expressionType != null) {

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: startingHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
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
    
    const expressionTypeOptions = [
      { label: '', value: null },
      { label: translate('Expression'), value: 'plsqlExpression' },
      { label: translate('Function Body'), value: 'plsqlFunctionBody' },
    ];

    const expressionType = completionHelper.getExtensionProperty(element, 'expressionType');

    entries.push(
      {
        id: 'expressionType',
        element,
        label: translate('Condition Type'),
        helper: completionHelper,
        property: 'expressionType',
        options: expressionTypeOptions,
        cleanup: (value) => {
          return {
            ...(!value && {expression: null}),
          };
        },
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );

    if (expressionType != null) {

      const EXPRESSION_DESCRIPTION = {
        plsqlExpression: translate('PL/SQL Expression returning a boolean value'),
        plsqlFunctionBody: translate('PL/SQL Function Body returning a boolean value'),
      };

      const description = EXPRESSION_DESCRIPTION[expressionType];

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Condition'),
          description: description,
          helper: completionHelper,
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

export function VisibilityProps(args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (is(element, 'bpmn:AdHocSubProcess')) {
    
    const visibilityOptions = [
      { label: translate('None'), value: 'none' },
      { label: translate('Sub Process'), value: 'subprocess' },
      { label: translate('Activities'), value: 'activities' },
      { label: translate('All'), value: 'all' },
    ];

    entries.push(
      {
        id: 'taskVisibility',
        element,
        label: translate('Task List Visibility'),
        helper: visibilityHelper,
        property: 'value',
        defaultValue: 'all',
        options: visibilityOptions,
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

  const visibility = visibilityHelper.getExtensionProperty(element, 'value');

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

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');

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
