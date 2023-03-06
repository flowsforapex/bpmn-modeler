import { isSelectEntryEdited, isTextAreaEntryEdited, NumberFieldEntry, SelectEntry, TextAreaEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import { OpenDialogLabel } from '../../helper/OpenDialogLabel';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

const CONDITIONAL_SOURCES = [
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];

function isConditionalSource(source) {
  return ModelingUtil.isAny(source, CONDITIONAL_SOURCES);
}

function getNextSequence(element) {
  var { sourceRef } = getBusinessObject(element);
  var maxSequence =
    Math.max(...sourceRef.outgoing.map(o => o.sequence || 0)) || 0;

  return Math.max(maxSequence + 10, sourceRef.outgoing.length * 10);
}

export function setDefaultSequence(element, modeling) {
  var businessObject = getBusinessObject(element);

  if (ModelingUtil.is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) {
    if (businessObject.sourceRef && !businessObject.sequence) {
      modeling.updateProperties(element, {
        sequence: getNextSequence(element),
      });
    }
  }
}

export default function (args) {

  const {element} = args;
  
  return [
    {
      id: 'sequence',
      element,
      component: Sequence,
      // isEdited: isNumberFieldEntryEdited,
    },
    {
      id: 'language',
      element,
      component: Language,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'condition',
      element,
      component: Condition,
      isEdited: isTextAreaEntryEdited,
    },
  ];
}

function Sequence(props) {
  const { id, element } = props;

  const businessObject = getBusinessObject(element);

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getNextSequence = (element) => {
    var { sourceRef } = businessObject;
    var maxSequence =
      Math.max(...sourceRef.outgoing.map(o => o.sequence || 0)) || 0;
  
    return Math.max(maxSequence + 10, sourceRef.outgoing.length * 10);
  };

  const getValue = () => {
    const value = businessObject.sequence;

    if (!value) {
      modeling.updateProperties(element, {
        sequence: getNextSequence(element),
      });
    }
  
    return businessObject.sequence;
  };

  const setValue = (value) => {
      modeling.updateProperties(element, {
        sequence: value,
      });
    };

  return new NumberFieldEntry({
    id: id,
    element: element,
    label: translate('Sequence'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function Language(props) {
  const { id, element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const { conditionExpression } = businessObject;

  const getValue = () => conditionExpression && conditionExpression.get('language');

  const setValue = (value) => {

    if (!conditionExpression) {
      const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
        body: null,
        language: value
      });
      formalExpression.$parent = businessObject;

      modeling.updateModdleProperties(element, businessObject, {
        conditionExpression: formalExpression,
      });
    } else if (value) {
      modeling.updateModdleProperties(element, conditionExpression, {
        language: value,
      });
    } else {
      modeling.updateModdleProperties(element, businessObject, {
        conditionExpression: undefined,
      });
    }
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Condition Type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: () => [
      { label: '', value: null },
      { label: translate('Expression'), value: 'plsqlExpression' },
      { label: translate('Function Body'), value: 'plsqlFunctionBody' },
    ],
    debounce: debounce,
  });
}

function Condition(props) {
  const { id, element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element);

  const { conditionExpression } = businessObject;

  const language = conditionExpression && conditionExpression.get('language');

  const getValue = () => conditionExpression && conditionExpression.get('body');

  const setValue = (value) => {

    if (!conditionExpression) {
      const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
        body: value,
      });
      formalExpression.$parent = businessObject;

      modeling.updateModdleProperties(element, businessObject, {
        conditionExpression: formalExpression,
      });
    } else {
      conditionExpression.set('body', value);

      modeling.updateModdleProperties(element, businessObject, {
        conditionExpression: conditionExpression,
      });
    }
  };

  const labelWithIcon =
    OpenDialogLabel('Condition', () => {
      const { conditionExpression } = businessObject;
      var getProperty = function () {
        return conditionExpression && conditionExpression.get('body');
      };
      var saveProperty = function (text) {
        conditionExpression.set('body', text);

        modeling.updateModdleProperties(element, businessObject, {
          conditionExpression: conditionExpression,
        });
      };
      openEditor(
        getProperty,
        saveProperty,
        'plsql',
        `${language}Boolean`
      );
    });

  const EXPRESSION_DESCRIPTION = {
    plsqlExpression: translate('PL/SQL Expression returning a boolean value'),
    plsqlFunctionBody: translate('PL/SQL Function Body returning a boolean value'),
  };

  const description = EXPRESSION_DESCRIPTION[language];

  if (language) {
    return [
      getContainer(translate),
      new TextAreaEntry({
        id: id,
        element: element,
        label: labelWithIcon,
        description: description,
        getValue: getValue,
        setValue: setValue,
        debounce: debounce,
      })
    ];
  }
}