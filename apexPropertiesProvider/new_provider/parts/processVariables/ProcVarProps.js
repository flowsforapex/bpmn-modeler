import {
  HeaderButton, isNumberFieldEntryEdited, isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited, NumberFieldEntry, SelectEntry,
  TextAreaEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { updateProperties } from '../../helper/util';

import { useService } from 'bpmn-js-properties-panel';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

export default function ParameterProps(props) {
  const { idPrefix, parameter } = props;

  return [
    {
      id: `${idPrefix}-varSequence`,
      component: VarSequence,
      idPrefix,
      parameter,
      isEdited: isNumberFieldEntryEdited,
    },
    {
      id: `${idPrefix}-varName`,
      component: VarName,
      idPrefix,
      parameter,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-varDataType`,
      component: VarDataType,
      idPrefix,
      parameter,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-varExpressionType`,
      component: VarExpressionType,
      idPrefix,
      parameter,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-varExpression`,
      component: VarExpression,
      idPrefix,
      parameter,
      isEdited: isTextAreaEntryEdited,
    },
    {
      id: 'plsqlCodeEditorContainer',
      parameter,
      component: PlsqlCodeEditorContainer,
    },
    {
      id: 'plsqlCodeEditor',
      parameter,
      component: PlsqlCodeEditor,
    },
  ];
}

function VarSequence(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    updateProperties(
      {
        element,
        moddleElement: parameter,
        properties: {
          varSequence: value,
        },
      },
      commandStack
    );
  };

  const getValue = parameter => parameter.varSequence;

  return NumberFieldEntry({
    element: parameter,
    id: `${idPrefix}-varSequence`,
    label: translate('Sequence'),
    getValue,
    setValue,
    debounce,
  });
}

function VarName(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    updateProperties(
      {
        element,
        moddleElement: parameter,
        properties: {
          varName: value,
        },
      },
      commandStack
    );
  };

  const getValue = parameter => parameter.varName;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-varName`,
    label: translate('Name'),
    getValue,
    setValue,
    debounce,
  });
}

function VarDataType(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const DATA_TYPE_DESCRIPTION = {
    DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
  };

  const getOptions = () => [
    { label: translate('Varchar2'), value: 'VARCHAR2' },
    { label: translate('Number'), value: 'NUMBER' },
    { label: translate('Date'), value: 'DATE' },
    { label: translate('Clob'), value: 'CLOB' },
  ];

  const setValue = (value) => {
    updateProperties(
      {
        element,
        moddleElement: parameter,
        properties: {
          varDataType: value,
        },
      },
      commandStack
    );
  };

  const getValue = parameter => parameter.varDataType;

  const description = DATA_TYPE_DESCRIPTION[parameter.varDataType];

  return SelectEntry({
    element: parameter,
    id: `${idPrefix}-varDataType`,
    label: translate('Data Type'),
    getValue,
    setValue,
    debounce,
    getOptions: getOptions,
    description: description,
  });
}

function VarExpressionType(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getOptions = () => {
    const { varDataType } = parameter;

    switch (varDataType) {
      case 'CLOB':
        return [
          { label: translate('Process Variable'), value: 'processVariable' },
        ];
      case 'NUMBER':
      case 'DATE':
        return [
          { label: translate('Static'), value: 'static' },
          { label: translate('Process Variable'), value: 'processVariable' },
          {
            label: translate('SQL query (single value)'),
            value: 'sqlQuerySingle',
          },
          { label: translate('Expression'), value: 'plsqlExpression' },
          { label: translate('Function Body'), value: 'plsqlFunctionBody' },
        ];
      default:
        return [
          { label: translate('Static'), value: 'static' },
          { label: translate('Process Variable'), value: 'processVariable' },
          {
            label: translate('SQL query (single value)'),
            value: 'sqlQuerySingle',
          },
          {
            label: translate('SQL query (colon delimited list)'),
            value: 'sqlQueryList',
          },
          { label: translate('Expression'), value: 'plsqlExpression' },
          { label: translate('Function Body'), value: 'plsqlFunctionBody' },
        ];
    }
  };

  const setValue = (value) => {
    updateProperties(
      {
        element,
        moddleElement: parameter,
        properties: {
          varExpressionType: value,
        },
      },
      commandStack
    );
  };

  const getValue = parameter => parameter.varExpressionType;

  return SelectEntry({
    element: parameter,
    id: `${idPrefix}-varExpressionType`,
    label: translate('Expression Type'),
    getValue,
    setValue,
    debounce,
    getOptions: getOptions,
  });
}

function VarExpression(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    updateProperties(
      {
        element,
        moddleElement: parameter,
        properties: {
          varExpression: value,
        },
      },
      commandStack
    );
  };

  const getValue = parameter => parameter.varExpression;

  const EXPRESSION_DESCRIPTION = {
    static: translate('Static value'),
    processVariable: translate('Name of the Process Variable'),
    sqlQuerySingle: translate('SQL query returning a single value'),
    sqlQueryList: translate('SQL query returning a colon delimited list'),
    plsqlExpression: translate('PL/SQL Expression returning a value'),
    plsqlFunctionBody: translate('PL/SQL Function Body returning a value'),
  };

  const description = EXPRESSION_DESCRIPTION[parameter.varExpressionType];

  return TextAreaEntry({
    element: parameter,
    id: `${idPrefix}-varExpression`,
    label: translate('Expression'),
    getValue,
    setValue,
    debounce,
    description: description,
  });
}

function PlsqlCodeEditorContainer() {
  const translate = useService('translate');

  return getContainer('varExpression', translate);
}

function PlsqlCodeEditor(props) {
  const { idPrefix, element, parameter } = props;
  const translate = useService('translate');
  const commandStack = useService('commandStack');

  const expressionType = parameter.varExpressionType;

  const language =
    expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

  if (
    [
      'sqlQuerySingle',
      'sqlQueryList',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    return new HeaderButton({
      id: `${idPrefix}-varExpressionEditor`,
      children: translate('Open editor'),
      onClick: function () {
        var getVarExpression = function () {
          return parameter.varExpression;
        };
        var saveVarExpression = function (text) {
          updateProperties(
            {
              element,
              moddleElement: parameter,
              properties: {
                varExpression: text,
              },
            },
            commandStack
          );
        };
        openEditor(
          'varExpression',
          getVarExpression,
          saveVarExpression,
          language,
          expressionType
        );
      },
    });
  }
}
