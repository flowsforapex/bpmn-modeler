import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

export default function ParameterProps(props) {
  const { idPrefix, parameter } = props;

  return [
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
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function VarName(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        varName: value,
      },
    });
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

  const getOptions = () => [
    { label: translate('Varchar2'), value: 'VARCHAR2' },
    { label: translate('Number'), value: 'NUMBER' },
    { label: translate('Date'), value: 'DATE' },
    { label: translate('Clob'), value: 'CLOB' },
  ];

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        varDataType: value,
      },
    });
  };

  const getValue = parameter => parameter.varDataType;

  return SelectEntry({
    element: parameter,
    id: `${idPrefix}-varDataType`,
    label: translate('Data Type'),
    getValue,
    setValue,
    debounce,
    getOptions: getOptions,
  });
}

function VarExpressionType(props) {
  const { idPrefix, element, parameter } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getOptions = () => [
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

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        varExpressionType: value,
      },
    });
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        varExpression: value,
      },
    });
  };

  const getValue = parameter => parameter.varExpression;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-varExpression`,
    label: translate('Expression'),
    getValue,
    setValue,
    debounce,
  });
}
