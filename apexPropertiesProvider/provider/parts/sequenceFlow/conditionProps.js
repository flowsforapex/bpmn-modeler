import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { getContainer, openEditor } from '../../plugins/monacoEditor';
import entryFactory from '../process_variables/custom/EntryFactory';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

const CONDITIONAL_SOURCES = [
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}

function getNextSequence(element) {
  var { sourceRef } = getBusinessObject(element);
  var maxSequence =
    Math.max(...sourceRef.outgoing.map(o => o.sequence || 0)) || 0;

  return Math.max(maxSequence + 10, sourceRef.outgoing.length * 10);
}

export function setDefaultSequence(element, bpmnFactory, elementRegistry) {
  var businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) {
    if (businessObject.sourceRef && !businessObject.sequence) {
      new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
        cmdHelper.updateBusinessObject(element, businessObject, {
          sequence: getNextSequence(element),
        }).context
      );
    }
  }
}

export function conditionProps(
  group,
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  const EXPRESSION_DESCRIPTION = {
    plsqlExpression: translate('PL/SQL Expression returning a boolean value'),
    plsqlFunctionBody: translate(
      'PL/SQL Function Body returning a boolean value'
    ),
  };

  var getProperty = function (property) {
    var businessObject = getBusinessObject(element);
    var { conditionExpression } = businessObject;
    var values = {};

    if (property === 'sequence') {
      if (!businessObject.sequence) {
        new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
          cmdHelper.updateBusinessObject(element, businessObject, {
            sequence: getNextSequence(element),
          }).context
        );
      }
      values = {
        sequence: businessObject.sequence,
      };
    }

    if (conditionExpression) {
      if (property === 'condition') {
        values = {
          condition: conditionExpression.get('body'),
          varExpressionDynamicDescription:
            EXPRESSION_DESCRIPTION[conditionExpression.get('language')],
        };
      }
      if (property === 'language') {
        values = {
          [property]: conditionExpression.get('language'),
        };
      }
    }

    return values;
  };

  var setProperty = function (values) {
    var businessObject = getBusinessObject(element);
    var commands = [];

    var { conditionExpression } = businessObject;

    if (values.language === 'null') {
      commands.push(
        cmdHelper.updateBusinessObject(element, businessObject, {
          conditionExpression: undefined,
        })
      );
    } else {
      if (values.sequence) {
        commands.push(
          cmdHelper.updateBusinessObject(element, businessObject, {
            sequence: values.sequence,
          })
        );
      }

      if (!conditionExpression) {
        conditionExpression = elementHelper.createElement(
          'bpmn:FormalExpression',
          values,
          businessObject,
          bpmnFactory
        );
      } else {
        if (values.condition) {
          conditionExpression.set('body', values.condition);
        }
        if (values.language) {
          conditionExpression.set('language', values.language);
        }
      }

      commands.push(
        cmdHelper.updateBusinessObject(element, businessObject, {
          conditionExpression: conditionExpression,
        })
      );
    }

    return commands;
  };

  if (is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) {
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'sequence',
        label: translate('Sequence'),
        modelProperty: 'sequence',
        set: function (element, values) {
          return setProperty(values);
        },
        get: function (element) {
          return getProperty('sequence');
        },
      })
    );

    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'language',
        label: translate('Condition Type'),
        modelProperty: 'language',
        selectOptions: [
          { name: '', value: null },
          { name: translate('Expression'), value: 'plsqlExpression' },
          {
            name: translate('Function Body'),
            value: 'plsqlFunctionBody',
          },
        ],
        set: function (element, values) {
          return setProperty(values);
        },
        get: function (element) {
          return getProperty('language');
        },
      })
    );

    group.entries.push(
      entryFactory.dynamicTextBox(translate, {
        id: 'condition',
        label: translate('Condition'),
        modelProperty: 'condition',
        dataValueDescription: 'varExpressionDynamicDescription',

        set: function (element, values) {
          return setProperty(values);
        },
        get: function (element) {
          return getProperty('condition');
        },
        show: function () {
          return getProperty('language').language != null;
        },
      })
    );

    // container for plsql editor
    group.entries.push(getContainer('condition', translate));

    // link to script editor
    group.entries.push(
      entryFactory.link(translate, {
        id: 'conditionEditor',
        buttonLabel: translate('Open Editor'),
        handleClick: function (element, node, event) {
          var getCondition = function () {
            return getProperty('condition').condition;
          };
          var setCondition = function (text) {
            var commands = setProperty({ condition: text });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor(
            'condition',
            getCondition,
            setCondition,
            'plsql',
            `${getProperty('language').language}Boolean`
          );
        },
        showLink: function () {
          return getProperty('language').language != null;
        },
      })
    );
  }
}
