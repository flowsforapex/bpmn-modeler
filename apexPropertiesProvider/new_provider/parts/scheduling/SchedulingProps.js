import {
  Group, HeaderButton,
  isSelectEntryEdited, isTextAreaEntryEdited, SelectEntry, TextAreaEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

const priorityHelper = new ExtensionHelper('apex:Priority');

export default function (element, injector) {
  return [
    {
      id: 'priority',
      element,
      component: Priority,
    },
    {
      id: 'dueDate',
      element,
      component: DueDate,
    }
  ];
}

/** *** Priority *** **/

function Priority(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new Group({
    id: id,
    element: element,
    label: translate('Priority'),
    entries: [
      {
        id: 'priorityExpressionType',
        element,
        component: PriorityExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'priorityExpression',
        element,
        component: PriorityExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'priorityExpressionEditorContainer',
        element,
        component: PriorityExpressionEditorContainer,
      },
      {
        id: 'priorityExpressionEditor',
        element,
        component: PriorityExpressionEditor,
      },
    ]
  });
}

function PriorityExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    priorityHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    priorityHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expressionType: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Expression Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Static'), value: 'static' },
        { label: translate('Process Variable'), value: 'processVariable' },
        { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
        { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
        { label: translate('Expression'), value: 'plsqlExpression' },
        { label: translate('Function Body'), value: 'plsqlFunctionBody' },
      ];
    },
  });
}

function PriorityExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    priorityHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
    priorityHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expression: value,
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function PriorityExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('PriorityExpression', translate);
}

function PriorityExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = priorityHelper.getExtensionProperty(element, 'expressionType');

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
      id: id,
      children: translate('Open editor'),
      onClick: function () {
        var getExpression = function () {
          return priorityHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          priorityHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'priorityExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}

/** *** Due Date *** **/

function DueDate(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new Group({
    id: id,
    element: element,
    label: translate('Due Date'),
    entries: [
      
    ]
  });
}