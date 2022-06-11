import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getContainer, openEditor } from '../../plugins/monacoEditor';

var { is } = require('bpmn-js/lib/util/ModelUtil');
var { isAny } = require('bpmn-js/lib/features/modeling/util/ModelingUtil');
var { getBusinessObject } = require('bpmn-js/lib/util/ModelUtil');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var CONDITIONAL_SOURCES = [
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
        };
      }
      if (property === 'conditionType') {
        values = {
          [property]: conditionExpression.get(property),
        };
      }
    }

    return values;
  };

  var setProperty = function (values) {
    var businessObject = getBusinessObject(element);
    var commands = [];

    var { conditionExpression } = businessObject;

    if (values.conditionType === 'null') {
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
        if (values.conditionType) {
          conditionExpression.set('conditionType', values.conditionType);
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
        id: 'conditionType',
        label: translate('Condition Type'),
        modelProperty: 'conditionType',
        selectOptions: [
          { name: '', value: null },
          { name: translate('PL/SQL Expression'), value: 'plsqlExpression' },
          {
            name: translate('PL/SQL Function Body'),
            value: 'plsqlFunctionBody',
          },
        ],
        set: function (element, values) {
          return setProperty(values);
        },
        get: function (element) {
          return getProperty('conditionType');
        },
      })
    );

    group.entries.push(
      entryFactory.textBox(translate, {
        id: 'condition',
        label: translate('Condition'),
        modelProperty: 'condition',
        set: function (element, values) {
          return setProperty(values);
        },
        get: function (element) {
          return getProperty('condition');
        },
        show: function () {
          return getProperty('conditionType').conditionType != null;
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
            console.log(commands);
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor(
            'condition',
            getCondition,
            setCondition,
            'plsql',
            getProperty('conditionType').conditionType
          );
        },
        showLink: function () {
          return getProperty('conditionType').conditionType != null;
        },
      })
    );
  }
}
