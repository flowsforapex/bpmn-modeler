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
  var type;
  if (timer) {
    if (typeof timer.get('timeDate') !== 'undefined') {
      type = 'timeDate';
    } else if (typeof timer.get('timeCycle') !== 'undefined') {
      type = 'timeCycle';
    } else if (typeof timer.get('timeDuration') !== 'undefined') {
      type = 'timeDuration';
    } else if (typeof timer.get('oracleDate') !== 'undefined') {
      type = 'oracleDate';
    } else if (typeof timer.get('oracleDuration') !== 'undefined') {
      type = 'oracleDuration';
    } else if (typeof timer.get('oracleCycle') !== 'undefined') {
      type = 'oracleCycle';
    }
  }
  return type;
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

function getTimerDefinitionProperty(
  timerEventDefinition,
  element,
  node,
  property
) {
  var timerDefinition = getTimerDefinition(timerEventDefinition, element, node);
  var type = getTimerDefinitionType(timerDefinition);
  var definition = type && timerDefinition.get(type);
  var value = definition && definition.get(property);

  return {
    [property]: value,
  };
}

function setTimerDefinitionProperty(
  timerEventDefinition,
  element,
  node,
  values
) {
  var timerDefinition = getTimerDefinition(timerEventDefinition, element, node);
  var type = getTimerDefinitionType(timerDefinition);
  var definition = type && timerDefinition.get(type);

  if (definition) {
    return cmdHelper.updateBusinessObject(element, definition, values);
  }
  return null;
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
  var prefix = options && options.idPrefix;
  var createTimerEventDefinition =
    options && options.createTimerEventDefinition;

  if (
    element.type === 'bpmn:StartEvent' ||
    element.type === 'bpmn:IntermediateCatchEvent' ||
    (element.type === 'bpmn:BoundaryEvent' &&
      element.businessObject.cancelActivity)
  ) {
    selectOptions = [
      { value: 'oracleDate', name: translate('Date (Oracle)') },
      { value: 'oracleDuration', name: translate('Duration (Oracle)') },
      { value: 'timeDate', name: translate('Date (ISO 8601)') },
      { value: 'timeDuration', name: translate('Duration (ISO 8601)') },
    ];
  } else {
    selectOptions = [
      { value: 'oracleDate', name: translate('Date (Oracle)') },
      { value: 'oracleDuration', name: translate('Duration (Oracle)') },
      { value: 'oracleCycle', name: translate('Cycle (Oracle)') },
      { value: 'timeDate', name: translate('Date (ISO 8601)') },
      { value: 'timeDuration', name: translate('Duration (ISO 8601)') },
    ];
  }

  group.entries.push(
    entryFactory.selectBox(translate, {
      id: `${prefix}timer-event-definition-type`,
      label: translate('Timer Definition Type'),
      selectOptions: selectOptions,
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
                { date: '', formatMask: '' },
                timerDefinition,
                bpmnFactory
              );
              break;
            }
            case 'oracleDuration': {
              props[newType] = elementHelper.createElement(
                'apex:OracleDuration',
                { interval: '' },
                timerDefinition,
                bpmnFactory
              );
              break;
            }
            case 'oracleCycle': {
              props[newType] = elementHelper.createElement(
                'apex:OracleCycle',
                {
                  startInterval: '',
                  loopInterval: '',
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
        var type = getTimerDefinitionType(timerDefinition);

        return (
          type !== 'timeDate' && type !== 'timeDuration' && type !== 'timeCycle'
        );
      },
    })
  );

  /* oracle date properties */

  // date string
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'date',
      label: translate('Date String'),
      modelProperty: 'date',

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'date'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleDate';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleDate' && !definition.get('date')) {
          return {
            date: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // format mask
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'formatMask',
      label: translate('Format Mask'),
      modelProperty: 'formatMask',
      description: translate('e.g. MM-DD-YYYY'),

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'formatMask'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleDate';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleDate' && !definition.get('formatMask')) {
          return {
            formatMask: translate('Must provide a value'),
          };
        }
      },
    })
  );

  /* oracle duration properties */

  // interval
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'interval',
      label: translate('Time until the timer fires'),
      modelProperty: 'interval',
      description: 'Interval in format DAY TO SECOND (D HH:MM:SS)',

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'interval'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleDuration';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleDuration' && !definition.get('interval')) {
          return {
            interval: translate('Must provide a value'),
          };
        }
      },
    })
  );

  /* oracle cycle properties */

  // start interval
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'startInterval',
      label: translate('Time until the timer fires first'),
      modelProperty: 'startInterval',
      description: 'Interval in format DAY TO SECOND (D HH:MM:SS)',

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'startInterval'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleCycle';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleCycle' && !definition.get('startInterval')) {
          return {
            startInterval: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // gap interval
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'loopInterval',
      label: translate('Time until timer fires again'),
      modelProperty: 'loopInterval',
      description: 'Interval in format DAY TO SECOND (D HH:MM:SS)',

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'loopInterval'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleCycle';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleCycle' && !definition.get('loopInterval')) {
          return {
            loopInterval: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // repitition
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'repitition',
      label: translate('Repitition'),
      modelProperty: 'repitition',
      description: 'Number of executions',

      get: function (element, node) {
        return getTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          'repitition'
        );
      },

      set: function (element, values, node) {
        return setTimerDefinitionProperty(
          timerEventDefinition,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);

        return type !== 'oracleCycle';
      },

      validate: function (element, node) {
        var timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node
        );
        var type = getTimerDefinitionType(timerDefinition);
        var definition = type && timerDefinition.get(type);

        if (type === 'oracleCycle' && !definition.get('repitition')) {
          return {
            repitition: translate('Must provide a value'),
          };
        }
      },
    })
  );
}

module.exports = TimerEventDefinition;
