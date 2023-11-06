import { CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { getBusinessObject } from '../../helper/util';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { useService } from 'bpmn-js-properties-panel';
import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil');
var minDash = require('min-dash');

const endpointHelper = new ExtensionHelper('apex:Endpoint');
const messageNameHelper = new ExtensionHelper('apex:MessageName');
const correlationKeyHelper = new ExtensionHelper('apex:CorrelationKey');
const correlationValueHelper = new ExtensionHelper('apex:CorrelationValue');
const payloadHelper = new ExtensionHelper('apex:Payload');

const payloadVariableHelper = new ExtensionHelper('apex:PayloadVariable');

export function getMessageEvent(element) {
  const businessObject = getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  
  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, 'bpmn:MessageEventDefinition');
  });
}

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (
    (is(element, 'bpmn:SendTask') && !['executePlsql'].includes(businessObject.type)) ||
    (is(element, 'bpmn:IntermediateThrowEvent') && getMessageEvent(element)) ||
    (is(element, 'bpmn:StartEvent') && getMessageEvent(element))
  ) {
    entries.push(
      {
        id: 'endpoint',
        element,
        component: DefaultExpression,
        helper: endpointHelper,
        label: translate('Endpoint'),
      },
      {
        id: 'messageName',
        element,
        component: DefaultExpression,
        helper: messageNameHelper,
        label: translate('Message Name')
      },
      {
        id: 'correlationKey',
        element,
        component: DefaultExpression,
        helper: correlationKeyHelper,
        label: translate('Correlation Key')
      },
      {
        id: 'correlationValue',
        element,
        component: DefaultExpression,
        helper: correlationValueHelper,
        label: translate('Correlation Value')
      },
      {
        id: 'payload',
        element,
        component: DefaultExpression,
        helper: payloadHelper,
        label: translate('Payload')
      },
    );
  } else if (
    (is(element, 'bpmn:ReceiveTask')) ||
    (is(element, 'bpmn:IntermediateCatchEvent') && getMessageEvent(element)) ||
    (is(element, 'bpmn:EndEvent') && getMessageEvent(element)) ||
    (is(element, 'bpmn:BoundaryEvent') && getMessageEvent(element))
  ) {
    entries.push(
      {
        id: 'messageName',
        element,
        component: DefaultExpression,
        helper: messageNameHelper,
        label: translate('Message Name')
      },
      {
        id: 'correlationKey',
        element,
        component: DefaultExpression,
        helper: correlationKeyHelper,
        label: translate('Correlation Key')
      },
      {
        id: 'correlationValue',
        element,
        component: DefaultExpression,
        helper: correlationValueHelper,
        label: translate('Correlation Value')
      },
      {
        id: 'payloadVariable',
        element,
        label: translate('Payload Variable'),
        component: PayloadVariable,
      },
    );
  }
  return entries;
}

function DefaultExpression(props) {
  const {element, id, helper, label} = props;

  const translate = useService('translate');

  const eventDefinition = getMessageEvent(element);
  
  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('Expression'), value: 'plsqlRawExpression' },
    { label: translate('Function Body'), value: 'plsqlRawFunctionBody' },
  ];

  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlRawExpression',
    'plsqlRawFunctionBody',
  ];

  const expressionType = helper.getExtensionProperty(element, 'expressionType', eventDefinition);
  
  const entries = [];

  entries.push(
    {
      id: 'expressionType',
      element,
      label: translate('Expression Type'),
      helper: helper,
      property: 'expressionType',
      options: expressionTypeOptions,
      cleanup: (value) => {
        return {
          ...(!value && {expression: null}),
        };
      },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
      parent: eventDefinition,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      const language =
        expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: helper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
          parent: eventDefinition,
        }
      );
    } else {
      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: helper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
          parent: eventDefinition,
        },
      );
    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: label,
    entries: entries,
  });
}

function PayloadVariable(props) {
  const {element, id} = props;

  const translate = useService('translate');

  const eventDefinition = getMessageEvent(element);
  
  const entries = [];

  entries.push(
    {
      id: 'payloadVariable',
      element,
      label: translate('Process Variable'),
      helper: payloadVariableHelper,
      property: 'value',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
      parent: eventDefinition,
    },
  );

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Return Payload Into'),
    entries: entries,
  });
}