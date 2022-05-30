import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

var { is } = require('bpmn-js/lib/util/ModelUtil');
var { isAny } = require('bpmn-js/lib/features/modeling/util/ModelingUtil');
var { getBusinessObject } = require('bpmn-js/lib/util/ModelUtil');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

function getNextSequence(element) {
  var { sourceRef } = getBusinessObject(element);
  var maxSequence =
    Math.max(...sourceRef.outgoing.map(o => o.sequence || 0)) || 0;

  return Math.max(maxSequence + 10, sourceRef.outgoing.length * 10);
}

export function setDefaultSequence(element, bpmnFactory, elementRegistry) {
  var businessObject = getBusinessObject(element);

  var conditionalEventDefinition =
    eventDefinitionHelper.getConditionalEventDefinition(element);

  if (
    !(
      is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)
    ) &&
    !conditionalEventDefinition
  ) {
    return;
  }

  if (businessObject.sourceRef && !businessObject.sequence) {
    new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
      cmdHelper.updateBusinessObject(element, businessObject, {
        sequence: getNextSequence(element),
      }).context
    );
  }
}

export function conditionProps(
  group,
  element,
  bpmnFactory,
  elementRegistry,
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

    return commands;
  };

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  var conditionalEventDefinition =
    eventDefinitionHelper.getConditionalEventDefinition(element);

  if (
    !(
      is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)
    ) &&
    !conditionalEventDefinition
  ) {
    return;
  }

  group.entries.push(
    entryFactory.selectBox(translate, {
      id: 'conditionType',
      label: translate('Condition Type'),
      modelProperty: 'conditionType',
      selectOptions: [
        { name: translate('PL/SQL Expression'), value: 'plsqlExpression' },
        { name: translate('PL/SQL Function Body'), value: 'plsqlFunctionBody' },
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
    entryFactory.textField(translate, {
      id: 'condition',
      label: translate('Condition'),
      modelProperty: 'condition',
      set: function (element, values) {
        return setProperty(values);
      },
      get: function (element) {
        return getProperty('condition');
      },
    })
  );

  /*
  var script = scriptImplementation('language', 'body', true, translate);
  group.entries.push({
    id: 'condition',
    label: translate('Condition'),
    html:
      `${'<div class="bpp-row">' + '<label for="conditionType">'}${escapeHTML(
        translate('Condition Type')
      )}</label>` +
      '<div class="bpp-field-wrapper">' +
      '<select id="conditionType" name="conditionType" data-value>' +
      `<option value="plsqlExpression">${escapeHTML(
        translate('PL/SQL Expression')
      )}</option>` +
      `<option value="plsqlFunctionBody">${escapeHTML(
        translate('PL/SQL Function Body')
      )}</option>` +
      '<option value="" selected></option>' +
      '</select>' +
      '</div>' +
      '</div>' +
      // expression
      '<div class="bpp-row">' +
      `<label for="plsqlExpression" data-show="isExpression">${escapeHTML(
        translate('PL/SQL Expression')
      )}</label>` +
      '<div class="bpp-field-wrapper" data-show="isExpression">' +
      '<input id="plsqlExpression" type="text" name="condition" />' +
      '<button class="action-button clear" data-action="clear" data-show="canClear">' +
      '<span>X</span>' +
      '</button>' +
      '</div>' +
      // `<div data-show="isScript">${script.template}</div>` +
      // function body
      '<div class="bpp-row">' +
      `<label for="plsqlFunctionBody" data-show="isFunctionBody">${escapeHTML(
        translate('PL/SQL Function Body')
      )}</label>` +
      '<div class="bpp-field-wrapper" data-show="isFunctionBody">' +
      '<input id="plsqlFunctionBody" type="text" name="condition" />' +
      '<button class="action-button clear" data-action="clear" data-show="canClear">' +
      '<span>X</span>' +
      '</button>' +
      '</div>' +
      '</div>',

    get: function (element, propertyName) {
      var { conditionExpression } = bo;

      console.log(conditionExpression);

      var values = {};

      if (conditionExpression) {
        values = conditionExpression;
        values.conditionType = conditionExpression.language;
        values.condition = conditionExpression.get('body');
      }

      console.log(values);

      return values;
    },

    set: function (element, values, containerElement) {
      var { conditionType, condition } = values;
      var commands = [];

      var conditionProps = {
        body: condition,
        language: conditionType,
      };

      var conditionOrConditionExpression;

      if (conditionType) {
        conditionOrConditionExpression = elementHelper.createElement(
          'bpmn:FormalExpression',
          conditionProps,
          conditionalEventDefinition || bo,
          bpmnFactory
        );

        var { source } = element;

        // if default-flow, remove default-property from source
        if (source && source.businessObject.default === bo) {
          commands.push(
            cmdHelper.updateProperties(source, { default: undefined })
          );
        }
      }

      commands.push(
        cmdHelper.updateBusinessObject(
          element,
          conditionalEventDefinition || bo,
          { conditionExpression: conditionOrConditionExpression }
        )
      );

      return commands;
    },

    validate: function (element, values) {
      var validationResult = {};

      if (!values.condition && values.conditionType === 'expression') {
        validationResult.condition = translate('Must provide a value');
      } else if (values.conditionType === 'script') {
        validationResult = script.validate(element, values);
      }

      return validationResult;
    },

    isExpression: function (element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return (
          conditionType.options[conditionType.selectedIndex].value ===
          'plsqlExpression'
        );
      }
    },

    isFunctionBody: function (element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return (
          conditionType.options[conditionType.selectedIndex].value ===
          'plsqlFunctionBody'
        );
      }
    },

    // isScript: function (element, inputNode) {
    //   var conditionType = domQuery('select[name=conditionType]', inputNode);
    //   if (conditionType.selectedIndex >= 0) {
    //     return (
    //       conditionType.options[conditionType.selectedIndex].value === 'script'
    //     );
    //   }
    // },

    clear: function (element, inputNode) {
      // clear text input
      domQuery('input[name=condition]', inputNode).value = '';

      return true;
    },

    canClear: function (element, inputNode) {
      var input = domQuery('input[name=condition]', inputNode);

      return input.value !== '';
    },

    script: script,

    cssClasses: ['bpp-textfield'],
  });
  */
}

// utilities //////////////////////////

var CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}
