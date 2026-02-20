import {
  CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { getBusinessObject } from '../../helper/util';

import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

const AiServiceHelper = new ExtensionHelper('apex:AiService');
const AiTemperatureHelper = new ExtensionHelper('apex:AiTemperature');
const AiPromptHelper = new ExtensionHelper('apex:AiPrompt');

const extensionHelper = new ExtensionHelper('apex:ResultVariable');

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];
    
  if (businessObject.type === 'apexAIGeneration') {

    entries.push(
      {
        id: 'AiService',
        element,
        component: AiService,
      },
      {
        id: 'AiTemperature',
        element,
        component: AiTemperature,
      },
      {
        id: 'AiPrompt',
        element,
        component: AiPrompt,
      },
      {
        id: 'resultVariable',
        element,
        label: translate('Result Variable'),
        description: translate('Name of the variable to return the AI result into'),
        helper: extensionHelper,
        property: 'resultVariable',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
    );
  }

  return entries;
}

function AiService(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlRawExpression' },
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlRawExpression',
    'plsqlRawFunctionBody',
  ];

  const expressionType = AiServiceHelper.getProperty({element, property: 'expressionType'});

  const entries = [];

  entries.push(
    {
      id: 'apexAIServiceExpressionType',
      element,
      label: translate('Expression Type'),
      helper: AiServiceHelper,
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

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'potentialUsersExpression',
          element,
          label: translate('Expression'),
          helper: AiServiceHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );

    } else {

      entries.push(
        {
          id: 'potentialUsersExpression',
          element,
          label: translate('Expression'),
          helper: AiServiceHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('APEX AI Service'),
    entries: entries
  });
}

function AiTemperature(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlRawExpression' },
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlRawExpression',
    'plsqlRawFunctionBody',
  ];

  const expressionType = AiTemperatureHelper.getProperty({element, property: 'expressionType'});

  const entries = [];

  entries.push(
    {
      id: 'potentialGroupsExpressionType',
      element,
      label: translate('Expression Type'),
      helper: AiTemperatureHelper,
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

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'potentialGroupsExpression',
          element,
          label: translate('Expression'),
          helper: AiTemperatureHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    } else {

      entries.push(
        {
          id: 'potentialGroupsExpression',
          element,
          label: translate('Expression'),
          helper: AiTemperatureHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('AI Temperature'),
    entries: entries
  });
}

function AiPrompt(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlRawExpression' },
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlRawExpression',
    'plsqlRawFunctionBody',
  ];

  const expressionType = AiTemperatureHelper.getProperty({element, property: 'expressionType'});

  const entries = [];

  entries.push(
    {
      id: 'excludedUsersExpressionType',
      element,
      label: translate('Expression Type'),
      helper: AiPromptHelper,
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

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'excludedUsersExpression',
          element,
          label: translate('Expression'),
          helper: AiPromptHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    } else {

      entries.push(
        {
          id: 'excludedUsersExpression',
          element,
          label: translate('Expression'),
          helper: AiPromptHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('AI Prompt'),
    entries: entries
  });
}