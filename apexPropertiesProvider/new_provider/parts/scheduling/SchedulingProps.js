import {
  Group, HeaderButton,
  isSelectEntryEdited, isTextAreaEntryEdited, SelectEntry, TextAreaEntry, TextFieldEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

import { quickpicks } from '../../helper/Quickpick';

const priorityHelper = new ExtensionHelper('apex:Priority');
const dueDateHelper = new ExtensionHelper('apex:DueDate');

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

  return new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
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
      {
        id: 'dueDateExpressionType',
        element,
        component: DueDateExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'dueDateFormatMask',
        element,
        component: DueDateFormatMask,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'dueDateExpression',
        element,
        component: DueDateExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'dueDateExpressionEditorContainer',
        element,
        component: DueDateExpressionEditorContainer,
      },
      {
        id: 'dueDateExpressionEditor',
        element,
        component: DueDateExpressionEditor,
      },
    ]
  });
}

function DueDateExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => // TODO clarify if default values needed (always existing in xml)
    // var value = dueDateHelper.getExtensionProperty(element, 'expressionType');

    // if (typeof value === 'undefined' || value === null) {
    //   dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
    //     expressionType: 'static',
    //   });
    // }

     dueDateHelper.getExtensionProperty(element, 'expressionType')
  ;    

  const setValue = value =>
    dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expressionType: value,
    });

  const getOptions = () => [
      { label: '', value: undefined }, // TODO not needed if using default value above
      { label: translate('Static Value (Timestamp)'), value: 'staticTimestamp' },
      { label: translate('Static Value (Duration)'), value: 'staticDuration' },
      { label: translate('Static Value (Scheduler Syntax)'), value: 'staticScheduler' },
      { label: translate('Process Variable'), value: 'processVariable' },
      { label: translate('SQL query'), value: 'sqlQuery'},
      { label: translate('Expression'), value: 'plsqlExpression' },
      { label: translate('Function Body'), value: 'plsqlFunctionBody' },
    ];

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Expression Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: getOptions
  });
}

function DueDateFormatMask(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    dueDateHelper.getExtensionProperty(element, 'formatMask');

  const setValue = value =>
    dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      formatMask: value,
    });

  if (dueDateHelper.getExtensionProperty(element, 'expressionType') === 'staticTimestamp') {
    return [
        new TextFieldEntry({
        id: id,
        element: element,
        label: translate('Format Mask'),
        getValue: getValue,
        setValue: setValue,
        debounce: debounce,
      }),
      quickpicks([
        {
          text: 'Oracle',
          handler: () => {
            dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
              formatMask: 'oracle',
            });
          }
        },
        {
          text: 'ISO',
          handler: () => {
            dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
              formatMask: 'iso',
            });
          }
        }
      ])
    ];
  }
}

function DueDateExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    dueDateHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
    dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expression: value,
    });

  return new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function DueDateExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('dueDateExpression', translate);
}

function DueDateExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = dueDateHelper.getExtensionProperty(element, 'expressionType');

  const language = 'plsql';

  if (
    [
      'sqlQuery',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    return new HeaderButton({
      id: id,
      children: translate('Open editor'),
      onClick: function () {
        var getExpression = function () {
          return dueDateHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'dueDateExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}