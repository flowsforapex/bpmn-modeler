import { CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

import { Quickpick, Quickpicks } from '../../helper/Quickpick';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

const priorityHelper = new ExtensionHelper('apex:Priority');
const dueOnHelper = new ExtensionHelper('apex:DueOn');

export default function (args) {

  const {element} = args;
  
  return [
    {
      id: 'priority',
      element,
      component: Priority,
    },
    {
      id: 'dueOn',
      element,
      component: DueOn,
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
      cleanup: (value) => {
        return {
          ...(!value && {expression: null}),
        };
      },
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

      const description =
        (ModelingUtil.is(element, 'bpmn:UserTask')) &&
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

/** *** Due On *** **/

function DueOn(props) {
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
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
  ];

  const expressionDescriptions = {
    static: translate('Timestamp with Timezone in ISO 8601 or Oracle format'),
    interval: translate('Duration in ISO 8601 or Oracle Interval DS \'DDD HH24:MI:SS\' format'),
    oracleScheduler: translate('Oracle Schedule expression'),
    processVariable: translate('Name of the Process Variable (of type Timestamp with Timezone)'),
    sqlQuerySingle: translate('SQL query returning Timestamp with Timezone'),
    plsqlRawExpression: translate('PL/SQL Expression returning Timestamp with Timezone'),
    plsqlRawFunctionBody: translate('PL/SQL Function Body returning Timestamp with Timezone'),
  };

  const editorTypes = [
    'sqlQuerySingle',
    'plsqlRawExpression',
    'plsqlRawFunctionBody',
  ];

  const expressionType = dueOnHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'dueOnExpressionType',
      element,
      label: 'Expression Type',
      helper: dueOnHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      cleanup: (value) => {
        return {
          ...(value !== 'static' && {formatMask: null}),
          ...(!value && {expression: null}),
        };
      },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
  );

  if (expressionType === 'static') {
    const description = Quickpicks([
      {
        text: translate('Oracle'),
        handler: () => {
          dueOnHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD HH24:MI:SS TZR',
          });
        }
      },
      {
        text: translate('ISO'),
        handler: () => {
          dueOnHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            formatMask: 'YYYY-MM-DD"T"HH24:MI:SS TZR',
          });
        }
      }
    ]);

    entries.push(
      {
        id: 'dueOnFormatMask',
        element,
        label: translate('Format Mask'),
        description: description,
        helper: dueOnHelper,
        property: 'formatMask',
        component: DefaultTextFieldEntry,
        isEdited: isTextAreaEntryEdited,
      }
    );
  }
  
  if (expressionType != null) {

    const getDescription = () => {
      const value = dueOnHelper.getExtensionProperty(element, 'expressionType');
  
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
            helper: dueOnHelper,
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
          helper: dueOnHelper,
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