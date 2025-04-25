import {
  isNumberFieldEntryEdited, isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { Helptext } from '../../helper/HelpText';

import { DefaultNumberEntry, DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

export default function ProcVarProps(args) {
  const { idPrefix, procVar, element, injector } = args;

  const translate = injector.get('translate');

  const entries = [];

  const { varExpressionType, varDataType } = procVar;

  const dataTypeOptions = [
    { label: translate('Varchar2'), value: 'VARCHAR2' },
    { label: translate('Number'), value: 'NUMBER' },
    { label: translate('Date'), value: 'DATE' },
    { label: translate('Timestamp with Time Zone'), value: 'TIMESTAMP_WITH_TIME_ZONE' },
    { label: translate('Clob'), value: 'CLOB' },
    { label: translate('JSON Object'), value: 'JSON' },
  ];
  
  const dataTypeDescription = {
    DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
  };

  const expressionTypeOptions = [
    ...(varDataType !== 'CLOB' ? [{ label: translate('Static'), value: 'static' }] : []),
    ...[{ label: translate('Process Variable'), value: 'processVariable' }],
    ...(varDataType !== 'CLOB' ? [{ label: translate('SQL query (single value)'), value: 'sqlQuerySingle' }] : []),
    ...(varDataType === 'VARCHAR2' ? [{ label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' }] : []),
    ...(varDataType === 'JSON' ? [{ label: translate('SQL query (JSON array)'), value: 'sqlQueryArray' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Expression'), value: 'plsqlRawExpression' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Expression (Legacy)'), value: 'plsqlExpression' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Function Body'), value: 'plsqlRawFunctionBody' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Function Body (Legacy)'), value: 'plsqlFunctionBody' }] : []),
  ];

  const expressionDescription = {
    static: {
      VARCHAR2: translate('Static varchar2 value'),
      NUMBER: translate('Static number value'),
      DATE: translate('Static date value'),
      TIMESTAMP_WITH_TIME_ZONE: translate('Static Timestamp with Time Zone value'),
    },
    processVariable: {
      VARCHAR2: translate('Name of the Process Variable'),
      NUMBER: translate('Name of the Process Variable'),
      DATE: translate('Name of the Process Variable'),
      TIMESTAMP_WITH_TIME_ZONE: translate('Name of the Process Variable'),
      CLOB: translate('Name of the Process Variable'),
    },
    sqlQuerySingle: {
      VARCHAR2: translate('SQL query returning a single varchar2 value'),
      NUMBER: translate('SQL query returning a single number value'),
      DATE: translate('SQL query returning a single date value'),
      TIMESTAMP_WITH_TIME_ZONE: translate('SQL query returning a single Timestamp with Time Zone value'),
    },
    sqlQueryList: {
      VARCHAR2: translate('SQL query returning a colon delimited list'),
    },
    plsqlRawExpression: {
      VARCHAR2: translate('PL/SQL Expression returning a varchar2 value'),
      NUMBER: translate('PL/SQL Expression returning a number value'),
      DATE: translate('PL/SQL Expression returning a date value'),
      TIMESTAMP_WITH_TIME_ZONE: translate('PL/SQL Expression returning a Timestamp with Time Zone value'),
    },
    plsqlExpression: {
      VARCHAR2: translate('PL/SQL Expression returning a varchar2 value'),
      NUMBER: translate('PL/SQL Expression returning a varchar2 value in number format'),
      DATE: translate('PL/SQL Expression returning a varchar2 value in format YYYY-MM-DD HH24:MI:SS'),
      TIMESTAMP_WITH_TIME_ZONE: translate('PL/SQL Expression returning a varchar2 value in format YYYY-MM-DD HH24:MI:SS TZR'),
    },
    plsqlRawFunctionBody: {
      VARCHAR2: translate('PL/SQL Function Body returning a varchar2 value'),
      NUMBER: translate('PL/SQL Function Body returning a number value'),
      DATE: translate('PL/SQL Function Body returning a date value'),
      TIMESTAMP_WITH_TIME_ZONE: translate('PL/SQL Function Body returning a Timestamp with Time Zone value'),
    },
    plsqlFunctionBody: {
      VARCHAR2: translate('PL/SQL Function Body returning a varchar2 value'),
      NUMBER: translate('PL/SQL Function Body returning a varchar2 value in number format'),
      DATE: translate('PL/SQL Function Body returning a varchar2 value in format YYYY-MM-DD HH24:MI:SS'),
      TIMESTAMP_WITH_TIME_ZONE: translate('PL/SQL Function Body returning a varchar2 value in format YYYY-MM-DD HH24:MI:SS TZR'),
    },
    sqlQueryArray: {
      JSON: translate('SQL query returning a JSON array'),
    }
  };

  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlRawExpression',
    'plsqlExpression',
    'plsqlRawFunctionBody',
    'plsqlFunctionBody',
    'sqlQueryArray'
  ];

  
  if (!ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant'])) {
    entries.push(
      {
        id: `${idPrefix}-varSequence`,
        element,
        listElement: procVar,
        label: translate('Sequence'),
        property: 'varSequence',
        component: DefaultNumberEntry,
        isEdited: isNumberFieldEntryEdited,
      }
    );
  }

  entries.push(
    {
      id: `${idPrefix}-varName`,
      element,
      listElement: procVar,
      label: translate('Name'),
      property: 'varName',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-varDataType`,
      element,
      listElement: procVar,
      label: translate('Data Type'),
      description: dataTypeDescription[varDataType],
      property: 'varDataType',
      options: dataTypeOptions,
      cleanup: (value) => {
        return {
                ...(value === 'CLOB' && varExpressionType !== 'processVariable' && {varExpressionType: 'processVariable', varExpression: null}),
                ...(value !== 'VARCHAR2' && varExpressionType === 'sqlQueryList' && {varExpressionType: 'static', varExpression: null}),
                ...(value !== 'JSON' && varExpressionType === 'sqlQueryArray' && {varExpressionType: 'static', varExpression: null})
              }; 
        },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (ModelingUtil.is(element, 'bpmn:CallActivity')) {
    entries.push(
      {
        id: `${idPrefix}-varDescription`,
        element,
        procVar,
        component: VarDescription,
      }
    );
  }

  if (ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant'])) {
    entries.push(
      {
        id: `${idPrefix}-varDescriptionInput`,
        element,
        listElement: procVar,
        label: translate('Description'),
        property: 'varDescription',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  } else {
    entries.push(
      {
        id: `${idPrefix}-varExpressionType`,
        element,
        listElement: procVar,
        label: translate('Expression Type'),
        property: 'varExpressionType',
        options: expressionTypeOptions,
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );

    if (varExpressionType != null) {

      if (editorTypes.includes(varExpressionType)) {

        const language =
          ['sqlQuerySingle', 'sqlQueryList', 'sqlQueryArray'].includes(varExpressionType) ? 'sql' : 'plsql';

          entries.push(
            {
              id: `${idPrefix}-varExpression`,
              element,
              listElement: procVar,
              label: translate('Expression'),
              description: expressionDescription[varExpressionType][varDataType],
              property: 'varExpression',
              language: language,
              type: varExpressionType,
              component: DefaultTextAreaEntryWithEditor,
              isEdited: isTextAreaEntryEdited,
            },
          );
      } else {

        entries.push(
          {
            id: `${idPrefix}-varExpression`,
            element,
            listElement: procVar,
            label: translate('Expression'),
            description: expressionDescription[varExpressionType][varDataType],
            property: 'varExpression',
            component: DefaultTextAreaEntry,
            isEdited: isTextAreaEntryEdited,
          },
        );
      }      
    }
  }
    
  return entries;
}

function VarDescription(props) {
  const { procVar } = props;

  return Helptext({
    text: procVar.varDescription,
  });
}