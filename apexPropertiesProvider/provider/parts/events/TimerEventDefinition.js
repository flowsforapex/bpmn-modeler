var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
 *
 * @return {string|undefined} the timer definition type
 */
function getTimerDefinitionType(timer) {
  if (!timer) {
    return;
  }

  var timeDate = timer.get('timeDate');
  if (typeof timeDate !== 'undefined') {
    return 'timeDate';
  }

  var timeCycle = timer.get('timeCycle');
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle';
  }

  var timeDuration = timer.get('timeDuration');
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration';
  }

  var oracleDate = timer.get('oracleDate');
  if (typeof oracleDate !== 'undefined') {
    return 'oracleDate';
  }

  var oracleDuration = timer.get('oracleDuration');
  if (typeof oracleDuration !== 'undefined') {
    return 'oracleDuration';
  }

  var oracleCycle = timer.get('oracleCycle');
  if (typeof oracleCycle !== 'undefined') {
    return 'oracleCycle';
  }
}

/**
 * Get the actual timer event definition based on option, whether it's a getter
 * to fetch the timer event definition or the exact event definition itself
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>|Function} timerOrFunction
 * @param {Shape} element
 * @param {HTMLElement} node
 *
 * @return ModdleElement<bpmn:TimerEventDefinition>
 */
function getTimerDefinition(timerOrFunction, element, node) {
  if (typeof timerOrFunction === 'function') {
    return timerOrFunction(element, node);
  }

  return timerOrFunction;
}

/**
 * Creates 'bpmn:FormalExpression' element.
 *
 * @param {ModdleElement} parent
 * @param {string} body
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement<bpmn:FormalExpression>} a formal expression
 */
function createFormalExpression(parent, body, bpmnFactory) {
  body = body || undefined;
  return elementHelper.createElement(
    'bpmn:FormalExpression',
    { body: body },
    parent,
    bpmnFactory
  );
}

function TimerEventDefinition(
  group,
  element,
  bpmnFactory,
  timerEventDefinition,
  translate,
  options
) {
  var selectOptions;

  if (
    element.type === 'bpmn:StartEvent' ||
    element.type === 'bpmn:IntermediateCatchEvent' ||
    element.type === 'bpmn:BoundaryEvent'
  ) {
    selectOptions = [
      { value: 'timeDate', name: translate('Date (ISO 8601)') },
      { value: 'timeDuration', name: translate('Duration (ISO 8601)') },
      { value: 'oracleDate', name: translate('Date (Oracle)') },
      { value: 'oracleDuration', name: translate('Duration (Oracle)') },
      { value: 'oracleCycle', name: translate('Cycle (Oracle)') },
    ];
    // currently: never occurs
  } else {
    selectOptions = [
      { value: 'timeDate', name: translate('Date') },
      { value: 'timeDuration', name: translate('Duration') },
      { value: 'timeCycle', name: translate('Cycle') },
    ];
  }

  var prefix = options && options.idPrefix;
  var createTimerEventDefinition =
    options && options.createTimerEventDefinition;

  group.entries.push(
    entryFactory.selectBox(translate, {
      id: `${prefix}timer-event-definition-type`,
      label: translate('Timer Definition Type'),
      selectOptions: selectOptions,
      emptyParameter: true,
      modelProperty: 'timerDefinitionType',

      get: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );

        return {
          timerDefinitionType: getTimerDefinitionType(timerDefinition) || '',
        };
      },

      set: function (element, values, node) {
        var props = {
          timeDuration: undefined,
          timeDate: undefined,
          timeCycle: undefined,
          oracleDate: undefined,
          oracleDuration: undefined,
          oracleCycle: undefined,
        };

        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var newType = values.timerDefinitionType;

        if (
          !timerDefinition &&
          typeof createTimerEventDefinition === 'function'
        ) {
          timerDefinition = createTimerEventDefinition(element, node);
        }

        if (values.timerDefinitionType) {
          var oldType = getTimerDefinitionType(timerDefinition);

          var value;
          if (oldType) {
            var definition = timerDefinition.get(oldType);
            value = definition.get('body');
          }

          switch (newType) {
            case 'oracleDate': {
              props[newType] = elementHelper.createElement(
                'apex:OracleDate',
                { body: value, dateString: '', formatMask: '' },
                timerDefinition,
                bpmnFactory
              );
              break;
            }
            case 'oracleDuration': {
              props[newType] = elementHelper.createElement(
                'apex:OracleDuration',
                { body: value, intervalString: '' },
                timerDefinition,
                bpmnFactory
              );
              break;
            }
            case 'oracleCycle': {
              props[newType] = elementHelper.createElement(
                'apex:OracleCycle',
                {
                  body: value,
                  startIntervalString: '',
                  gapIntervalString: '',
                  repitition: '',
                },
                timerDefinition,
                bpmnFactory
              );
              break;
            }
            default:
              props[newType] = createFormalExpression(
                timerDefinition,
                value,
                bpmnFactory
              );
          }
        }

        return cmdHelper.updateBusinessObject(element, timerDefinition, props);
      },

      hidden: function (element, node) {
        return (
          getTimerDefinition(timerEventDefinition, element, node) === undefined
        );
      },
    })
  );

  group.entries.push(
    entryFactory.textField(translate, {
      id: `${prefix}timer-event-definition`,
      label: translate('Timer Definition'),
      modelProperty: 'timerDefinition',

      get: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);
        var value = definition && definition.get('body');

        return {
          timerDefinition: value,
        };
      },

      set: function (element, values, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (definition) {
          return cmdHelper.updateBusinessObject(element, definition, {
            body: values.timerDefinition || undefined,
          });
        }
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (definition) {
          var value = definition.get('body');
          if (!value) {
            return {
              timerDefinition: translate('Must provide a value'),
            };
          }
        }
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );

        return !getTimerDefinitionType(timerDefinition);
      },
    })
  );

  /* custom oracle */

  group.entries.push(
    entryFactory.textField(translate, {
      id: 'dateString',
      label: translate('Date String'),
      modelProperty: 'dateString',

      get: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);
        var value = definition && definition.get('dateString');

        return {
          dateString: value,
        };
      },

      set: function (element, values, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (definition) {
          return cmdHelper.updateBusinessObject(element, definition, {
            dateString: values.dateString || undefined,
          });
        }
      },

      // validate: function (element, node) {
      //   var timerDefinition = getTimerDefinition(
      //     timerEventDefinition,
      //     element,
      //     node
      //   );
      //   var type = getTimerDefinitionType(timerDefinition);
      //   var definition = type && timerDefinition.get(type);

      //   if (definition) {
      //     var value = definition.get('body');
      //     if (!value) {
      //       return {
      //         timerDefinition: translate('Must provide a value'),
      //       };
      //     }
      //   }
      // },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleDate';
      },
    })
  );
}

module.exports = TimerEventDefinition;
