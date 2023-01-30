import {
  isNumberFieldEntryEdited, isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { Helptext } from '../../helper/HelpText';

import { DefaultNumberEntry, DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function ProcVarProps(args) {
  const { idPrefix, procVar, element, injector } = args;

  const translate = injector.get('translate');

  const entries = [];

  const { varExpressionType, varDataType } = procVar;

  const dataTypeOptions = [
    { label: translate('Varchar2'), value: 'VARCHAR2' },
    { label: translate('Number'), value: 'NUMBER' },
    { label: translate('Date'), value: 'DATE' },
    { label: translate('Timestamp'), value: 'TIMESTAMP' },
    { label: translate('Clob'), value: 'CLOB' },
  ];
  
  const dataTypeDescription = {
    DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
  };

  const expressionTypeOptions = [
    ...(varDataType !== 'CLOB' ? [{ label: translate('Static'), value: 'static' }] : []),
    ...[{ label: translate('Process Variable'), value: 'processVariable' }],
    ...(varDataType !== 'CLOB' ? [{ label: translate('SQL query (single value)'), value: 'sqlQuerySingle' }] : []),
    ...(varDataType === 'VARCHAR2' ? [{ label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Expression'), value: 'plsqlExpression' }] : []),
    ...(varDataType !== 'CLOB' ? [{ label: translate('Function Body'), value: 'plsqlFunctionBody' }] : []),
  ];

  const expressionDescription = {
    static: translate('Static value'),
    processVariable: translate('Name of the Process Variable'),
    sqlQuerySingle: translate('SQL query returning a single value'),
    sqlQueryList: translate('SQL query returning a colon delimited list'),
    plsqlExpression: translate('PL/SQL Expression returning a value'),
    plsqlFunctionBody: translate('PL/SQL Function Body returning a value'),
  };

  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlExpression',
    'plsqlFunctionBody',
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
          varExpressionType === 'sqlQuerySingle' || varExpressionType === 'sqlQueryList' ? 'sql' : 'plsql';

          entries.push(
            {
              id: `${idPrefix}-varExpression`,
              element,
              listElement: procVar,
              label: translate('Expression'),
              description: expressionDescription[varExpressionType],
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
            description: expressionDescription[varExpressionType],
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