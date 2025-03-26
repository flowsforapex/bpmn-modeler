import { CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { useService } from 'bpmn-js-properties-panel';
import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry } from '../../helper/templates';

const descriptionHelper = new ExtensionHelper('apex:Description');
const inputCollectionHelper = new ExtensionHelper('apex:InputCollection');
const outputCollectionHelper = new ExtensionHelper('apex:OutputCollection');
const completionConditionHelper = new ExtensionHelper('apex:CompletionCondition');

export function getLoopCharacteristics(element) {
  const businessObject = getBusinessObject(element);
  const {loopCharacteristics} = businessObject;
  
  return loopCharacteristics;
}

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (
    (is(element, 'bpmn:Task') || is(element, 'bpmn:SubProcess'))
    && businessObject.loopCharacteristics
  ) {
    entries.push(
      {
        id: 'description',
        element,
        component: DescriptionProp,
        isEdited: isTextFieldEntryEdited,
      }
    );

    const loopCharacteristics = getLoopCharacteristics(element);

    if (!is(loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) {
      entries.push(
        {
          id: 'inputCollection',
          element,
          component: InputCollection,
          helper: inputCollectionHelper,
          label: translate('Input Collection'),
        }
      );
    }

    entries.push(
      {
        id: 'outputCollection',
        element,
        component: OutputCollection,
        helper: outputCollectionHelper,
        label: translate('Output Collection')
      },
      {
        id: 'completionCondition',
        element,
        component: CompletionCondition,
        helper: completionConditionHelper,
        label: translate('Completion Condition')
      }
    );
  }

  return entries;
}

function DescriptionProp(props) {
  const {element, id} = props;

  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const entries = [];

  entries.push(
    {
      id: id,
      element,
      label: translate('Description'),
      helper: descriptionHelper,
      property: 'value',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
      parent: loopCharacteristics,
    },
  );

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Description'),
    entries: entries,
  });
}

function InputCollection(props) {
  const {element, id, helper, label} = props;

  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);
  
  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Process Variable (List)'), value: 'processVariableList' },
    { label: translate('Process Variable (Array)'), value: 'processVariableArray' },
    { label: translate('SQL Query'), value: 'sqlQueryArray' },
  ];

  const editorTypes = [
    'sqlQueryArray',
  ];

  const expressionType = helper.getExtensionProperty(element, 'expressionType', loopCharacteristics);
  
  const entries = [];

  entries.push(
    {
      id: 'expressionType',
      element,
      label: translate('Collection Type'),
      helper: helper,
      property: 'expressionType',
      options: expressionTypeOptions,
      cleanup: (value) => {
        return {
          ...(!value && {expression: null}),
          ...(value !== 'list' && {insideVariable: null})
        };
      },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
      parent: loopCharacteristics,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: helper,
          property: 'expression',
          language: 'sql',
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
          parent: loopCharacteristics,
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
          parent: loopCharacteristics,
        },
      );
    
    }

    if (expressionType === 'processVariableList') {

      entries.push(
        {
          id: 'insideVariable',
          element,
          label: translate('Input Element'),
          helper: helper,
          property: 'insideVariable',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
          parent: loopCharacteristics,
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

function OutputCollection(props) {
  const {element, id, helper, label} = props;

  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);
  
  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Process Variable (Array)'), value: 'processVariableArray' },
  ];

  const editorTypes = [];

  const expressionType = helper.getExtensionProperty(element, 'expressionType', loopCharacteristics);
  
  const entries = [];

  entries.push(
    {
      id: 'expressionType',
      element,
      label: translate('Collection Type'),
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
      parent: loopCharacteristics,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      entries.push(
        {
          id: 'expression',
          element,
          label: translate('Expression'),
          helper: helper,
          property: 'expression',
          language: 'sql',
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
          parent: loopCharacteristics,
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
          parent: loopCharacteristics,
        },
      );
    
    }
  }

  entries.push(
    {
      id: 'insideVariable',
      element,
      label: translate('Output Element'),
      helper: helper,
      property: 'insideVariable',
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
      parent: loopCharacteristics,
    },
  );

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: label,
    entries: entries,
  });
}

function CompletionCondition(props) {
  const {element, id, helper, label} = props;

  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);
  
  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Expression'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlFunctionBody' },
  ];

  const expressionType = helper.getExtensionProperty(element, 'expressionType', loopCharacteristics);
  
  const entries = [];

  entries.push(
    {
      id: 'expressionType',
      element,
      label: translate('Condition Type'),
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
      parent: loopCharacteristics,
    }
  );

  if (expressionType != null) {

    const EXPRESSION_DESCRIPTION = {
      plsqlExpression: translate('PL/SQL Expression returning a boolean value'),
      plsqlFunctionBody: translate('PL/SQL Function Body returning a boolean value'),
    };

    const description = EXPRESSION_DESCRIPTION[expressionType];

    entries.push(
      {
        id: 'expression',
        element,
        label: translate('Condition'),
        description: description,
        helper: helper,
        property: 'expression',
        language: 'plsql',
        type: `${expressionType}Boolean`, // TODO check editor validation
        component: DefaultTextAreaEntryWithEditor,
        isEdited: isTextAreaEntryEdited,
        parent: loopCharacteristics,
      }
    );

  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: label,
    entries: entries,
  });
}