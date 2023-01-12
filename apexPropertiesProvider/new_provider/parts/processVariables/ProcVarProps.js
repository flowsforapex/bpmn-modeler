import {
  isNumberFieldEntryEdited, isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited, NumberFieldEntry, SelectEntry,
  TextAreaEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { helptext } from '../../helper/HelpText';

import { useService } from 'bpmn-js-properties-panel';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

import { OpenDialogLabel } from '../../helper/OpenDialogLabel';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function ProcVarProps(props) {
  const { idPrefix, parameter, element } = props;

  const entries = [];

  if (!ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant'])) {
    entries.push(
      {
        id: `${idPrefix}-varSequence`,
        component: VarSequence,
        idPrefix,
        parameter,
        isEdited: isNumberFieldEntryEdited,
      }
    );
  }

  entries.push(
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
    }
  );

  if (ModelingUtil.is(element, 'bpmn:CallActivity')) {
    entries.push(
      {
        id: `${idPrefix}-varDescription`,
        component: VarDescription,
        idPrefix,
        parameter,
      }
    );
  }

  if (ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant'])) {
    entries.push(
      {
        id: `${idPrefix}-varDescriptionInput`,
        component: VarDescriptionInput,
        idPrefix,
        parameter,
        isEdited: isTextFieldEntryEdited,
      }
    );
  } else {
    entries.push(
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
      }
    );
  }
    
  return entries;
}

function VarSequence(props) {
  const { idPrefix, element, parameter } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      varSequence: String(value),
    });
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

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      varName: value,
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

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const DATA_TYPE_DESCRIPTION = {
    DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
  };

  const getOptions = () => [
    { label: translate('Varchar2'), value: 'VARCHAR2' },
    { label: translate('Number'), value: 'NUMBER' },
    { label: translate('Date'), value: 'DATE' },
    { label: translate('Timestamp'), value: 'TIMESTAMP' },
    { label: translate('Clob'), value: 'CLOB' },
  ];

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      varDataType: value,
    });
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

function VarDescription(props) {
  const { idPrefix, element, parameter } = props;

  return helptext({
    text: parameter.varDescription,
  });
}

function VarDescriptionInput(props) {
  const { idPrefix, element, parameter } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      varDescription: value,
    });
  };

  const getValue = parameter => parameter.varDescription;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-varDescription`,
    label: translate('Description'),
    getValue,
    setValue,
    debounce,
  });
}

function VarExpressionType(props) {
  const { idPrefix, element, parameter } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const getOptions = () => {
    const { varDataType } = parameter;

    switch (varDataType) {
      case 'CLOB':
        return [
          { label: translate('Process Variable'), value: 'processVariable' },
        ];
      case 'NUMBER':
      case 'DATE':
      case 'TIMESTAMP':
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
    modeling.updateModdleProperties(element, parameter, {
      varExpressionType: value,
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

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      varExpression: value,
    });
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

  const expressionType = parameter.varExpressionType;

  const language =
    expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

  let label;

  if (
    [
      'sqlQuerySingle',
      'sqlQueryList',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    label = OpenDialogLabel(translate('Expression'), () => {
      var getVarExpression = function () {
        return parameter.varExpression;
      };
      var saveVarExpression = function (text) {
        modeling.updateModdleProperties(element, parameter, {
          varExpression: text,
        });
      };
      openEditor(
        'varExpression',
        getVarExpression,
        saveVarExpression,
        language,
        expressionType
      );
    });
  } else {
    label = translate('Expression');
  }

  return TextAreaEntry({
    element: parameter,
    id: `${idPrefix}-varExpression`,
    label: label,
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
