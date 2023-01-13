import { CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

import { Quickpick, Quickpicks } from '../../helper/Quickpick';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

const priorityHelper = new ExtensionHelper('apex:Priority');
const dueDateHelper = new ExtensionHelper('apex:DueDate');

export default function (args) {

  const {element} = args;
  
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
  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('Expression'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlFunctionBody' },
  ];

  const staticPriorityOptions = [
    { label: '', value: null },
    { label: translate('1-Urgent'), value: '1' },
    { label: translate('2-High'), value: '2' },
    { label: translate('3-Medium'), value: '3' },
    { label: translate('4-Low'), value: '4' },
    { label: translate('5-Lowest'), value: '5' },
  ];

  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlExpression',
    'plsqlFunctionBody',
  ];
  
  const expressionType = priorityHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'expressionType',
      element,
      label: translate('Expression Type'),
      helper: priorityHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (expressionType === 'static') {
    entries.push(
      {
        id: 'expression',
        element,
        label: translate('Expression'),
        helper: priorityHelper,
        property: 'expression',
        options: staticPriorityOptions,
        component: DefaultSelectEntry,
        isEdited: isSelectEntryEdited,
      }
    );
  } else if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      const language =
        expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

        entries.push(
          {
            id: 'expression',
            element,
            label: translate('Expression'),
            helper: priorityHelper,
            property: 'expression',
            language: language,
            type: expressionType,
            component: DefaultTextAreaEntryWithEditor,
            isEdited: isTextAreaEntryEdited,
          },
        );
    } else {

      let description;

      if (ModelingUtil.is(element, 'bpmn:UserTask')) {
        description = 
          Quickpick(
            {
              text: translate('Process Priority'),
              handler: () => {
                priorityHelper.setExtensionProperty(element, modeling, bpmnFactory, {
                  expression: 'PROCESS_PRIORITY',
                });
              }
            }
          );
      }

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          description: description,
          helper: priorityHelper,
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
    label: translate('Priority'),
    entries: entries,
  });
}

/** *** Due Date *** **/

function DueDate(props) {
  const { element, id } = props;

  const translate = useService('translate');
  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Interval'), value: 'interval' },
    { label: translate('Scheduler Expression'), value: 'oracleScheduler' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query'), value: 'sqlQuerySingle' },
    { label: translate('Expression'), value: 'plsqlRawExpression' },
    { label: translate('Expression returning VC2 (legacy)'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
    { label: translate('Function Body returning VC2 (legacy)'), value: 'plsqlFunctionBody' },
  ];

  const expressionDescriptions = {
    static: translate('Timestamp with Timezone in ISO 8601 or Oracle format'),
    interval: translate('Duration in ISO 8601 or Oracle Interval DS \'DDD HH24:MI:SS\' format'),
    oracleScheduler: translate('Oracle Schedule expression'),
    processVariable: translate('Name of the Process Variable (of type Timestamp with Timezone)'),
    sqlQuerySingle: translate('SQL query returning Timestamp with Timezone'),
    plsqlRawExpression: translate('PL/SQL Expression returning Timestamp with Timezone'),
    plsqlExpression: translate('PL/SQL Expression returning varchar2 containing a Timestamp with Timezone in format YYYY-MM-DD HH24:MI:SS TZR'),
    plsqlRawFunctionBody: translate('PL/SQL Function Body returning Timestamp with Timezone'),
    plsqlFunctionBody: translate('PL/SQL Function Body returning varchar2 containing a Timestamp with Timezone in format YYYY-MM-DD HH24:MI:SS TZR')
  };

  const editorTypes = [
    'sqlQuerySingle',
    'plsqlRawExpression',
    'plsqlExpression',
    'plsqlRawFunctionBody',
    'plsqlFunctionBody',
  ];

  const expressionType = dueDateHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'dueDateExpressionType',
      element,
      label: 'Expression Type',
      helper: dueDateHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
  );

  if (expressionType === 'static') {
    const description = Quickpicks([
      {
        text: translate('Oracle'),
        handler: () => {
          dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD HH24:MI:SS TZR',
          });
        }
      },
      {
        text: translate('ISO'),
        handler: () => {
          dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD"T"HH24:MI:SS TZR',
          });
        }
      }
    ]);

    entries.push(
      {
        id: 'dueDateFormatMask',
        element,
        label: translate('Format Mask'),
        description: description,
        helper: dueDateHelper,
        property: 'formatMask',
        component: DefaultTextFieldEntry,
        isEdited: isTextAreaEntryEdited,
      }
    );
  }
  
  if (expressionType != null) {

    const getDescription = () => {
      const value = dueDateHelper.getExtensionProperty(element, 'expressionType');
  
      return expressionDescriptions[value];
    };

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' ? 'sql' : 'plsql';

        entries.push(
          {
            id: 'expression',
            element,
            label: translate('Expression'),
            description: getDescription(),
            helper: dueDateHelper,
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
          id: 'expression',
          element,
          label: translate('Expression'),
          description: getDescription(),
          helper: dueDateHelper,
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
    label: translate('Due On'),
    entries: entries
  });
}

/*
function DueDateExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    dueDateHelper.getExtensionProperty(element, 'expressionType');    

  const setValue = (value) => {
    const update = {
      expressionType: value,
      ...(value !== 'static' && {formatMask: null}),
      ...(!value && {expression: null}),
    };
    
    dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, update);
  };

  const getOptions = () => [
      { label: '', value: null },
      { label: translate('Static'), value: 'static' },
      { label: translate('Interval'), value: 'interval' },
      { label: translate('Scheduler Expression'), value: 'oracleScheduler' },
      { label: translate('Process Variable'), value: 'processVariable' },
      { label: translate('SQL query'), value: 'sqlQuerySingle' },
      { label: translate('Expression'), value: 'plsqlRawExpression' },
      { label: translate('Expression returning VC2 (legacy)'), value: 'plsqlExpression' },
      { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
      { label: translate('Function Body returning VC2 (legacy)'), value: 'plsqlFunctionBody' },
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

  const expressionType = dueDateHelper.getExtensionProperty(element, 'expressionType'); 

  if (expressionType === 'static') {

    const description = Quickpicks([
      {
        text: translate('Oracle'),
        handler: () => {
          dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD HH24:MI:SS TZR',
          });
        }
      },
      {
        text: translate('ISO'),
        handler: () => {
          dueDateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD"T"HH24:MI:SS TZR',
          });
        }
      }
    ]);

    return [
        new TextFieldEntry({
        id: id,
        element: element,
        label: translate('Format Mask'),
        description: description,
        getValue: getValue,
        setValue: setValue,
        debounce: debounce,
      }),
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

  const getDescription = () => {
    const value = dueDateHelper.getExtensionProperty(element, 'expressionType');

    switch (value) {
      case 'static': return translate('Timestamp with Timezone in ISO 8601 or Oracle format');
      case 'interval': return translate('Duration in ISO 8601 or Oracle Interval DS \'DDD HH24:MI:SS\' format');
      case 'oracleScheduler': return translate('Oracle Schedule expression');
      case 'processVariable': return translate('Name of the Process Variable (of type Timestamp with Timezone)');
      case 'sqlQuerySingle': return translate('SQL query returning Timestamp with Timezone');
      case 'plsqlRawExpression': return translate('PL/SQL Expression returning Timestamp with Timezone');
      case 'plsqlExpression': return translate('PL/SQL Expression returning varchar2 containing a Timestamp with Timezone in format YYYY-MM-DD HH24:MI:SS TZR');
      case 'plsqlRawFunctionBody': return translate('PL/SQL Function Body returning Timestamp with Timezone');
      case 'plsqlFunctionBody': return translate('PL/SQL Function Body returning varchar2 containing a Timestamp with Timezone in format YYYY-MM-DD HH24:MI:SS TZR');
      default: return '';
    }

  };

  const expressionType = dueDateHelper.getExtensionProperty(element, 'expressionType');

  const language =
    expressionType === 'sqlQuerySingle' ? 'sql' : 'plsql';

  let label;

  if (
    [
      'sqlQuerySingle',
      'plsqlRawExpression',
      'plsqlExpression',
      'plsqlRawFunctionBody',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    label = OpenDialogLabel(translate('Expression'), () => {
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
    });
  } else {
    label = translate('Expression');
  }

  if (expressionType != null) {
    return new TextAreaEntry({
      id: id,
      element: element,
      label: label,
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      description: getDescription()
    });
  }
}

function DueDateExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('dueDateExpression', translate);
}
*/