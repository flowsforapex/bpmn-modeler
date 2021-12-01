var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
const { default: propertiesHelper } = require('../../helper/propertiesHelper');

var dateHelper = new propertiesHelper('apex:OracleDate');
var durationHelper = new propertiesHelper('apex:OracleDuration');
var cycleHelper = new propertiesHelper('apex:OracleCycle');

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
    } else if (typeof timer.get('timerType') !== 'undefined') {
      type = timer.get('timerType');
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
      { value: 'timeCycle', name: translate('Cycle (ISO 8601)') },
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
          timerType: undefined,
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
          if (['timeDate', 'timeDuration', 'timeCycle'].includes(oldType)) {
            var definition = timerDefinition.get(oldType);
            value = definition.get('body');
          }

          if (
            ['oracleDate', 'oracleDuration', 'oracleCycle'].includes(newType)
          ) {
            props.timerType = newType;
          } else {
            props[newType] = createFormalExpression(
              timerDefinition,
              value,
              bpmnFactory
            );
          }
          return cmdHelper.updateBusinessObject(
            element,
            timerDefinition,
            props
          );
        }
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

        if (['timeDate', 'timeDuration', 'timeCycle'].includes(type)) {
          var definition = type && timerDefinition.get(type);
          if (definition) {
            var value = definition.get('body');
            if (!value) {
              return {
                timerDefinition: translate('Must provide a value'),
              };
            }
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

        return !['timeDate', 'timeDuration', 'timeCycle'].includes(type);
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

      get: function (element) {
        return dateHelper.getExtensionProperty(
          element,
          'date',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return dateHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value = dateHelper.getExtensionProperty(
          element,
          'date',
          timerEventDefinition
        ).date;

        if (type === 'oracleDate' && !value) {
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

      get: function (element) {
        return dateHelper.getExtensionProperty(
          element,
          'formatMask',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return dateHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value = dateHelper.getExtensionProperty(
          element,
          'formatMask',
          timerEventDefinition
        ).formatMask;

        if (type === 'oracleDate' && !value) {
          return {
            formatMask: translate('Must provide a value'),
          };
        }
      },
    })
  );

  /* oracle duration properties */

  // interval year-month
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'intervalYM',
      label: translate('Time until the timer fires'),
      modelProperty: 'intervalYM',
      description: translate(
        'Interval in format <br/> YEAR(2) TO MONTH <br/> (YY-MM)'
      ),

      get: function (element) {
        return durationHelper.getExtensionProperty(
          element,
          'intervalYM',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return durationHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value =
          durationHelper.getExtensionProperty(
            element,
            'intervalYM',
            timerEventDefinition
          ).intervalYM ||
          durationHelper.getExtensionProperty(
            element,
            'intervalDS',
            timerEventDefinition
          ).intervalDS;

        if (type === 'oracleDuration' && !value) {
          return {
            intervalYM: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // interval day-second
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'intervalDS',
      label: translate('Time until the timer fires'),
      modelProperty: 'intervalDS',
      description: translate(
        'Interval in format <br/> DAY(3) TO SECOND(0) <br/> (DDD HH:MM:SS)'
      ),

      get: function (element) {
        return durationHelper.getExtensionProperty(
          element,
          'intervalDS',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return durationHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value =
          durationHelper.getExtensionProperty(
            element,
            'intervalYM',
            timerEventDefinition
          ).intervalYM ||
          durationHelper.getExtensionProperty(
            element,
            'intervalDS',
            timerEventDefinition
          ).intervalDS;

        if (type === 'oracleDuration' && !value) {
          return {
            intervalDS: translate('Must provide a value'),
          };
        }
      },
    })
  );

  /* oracle cycle properties */

  // start interval
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'startIntervalDS',
      label: translate('Time until the timer fires first'),
      modelProperty: 'startIntervalDS',
      description: translate(
        'Interval in format <br/> DAY(3) TO SECOND(0) <br/> (DDD HH:MM:SS)'
      ),

      get: function (element) {
        return cycleHelper.getExtensionProperty(
          element,
          'startIntervalDS',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return cycleHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value = cycleHelper.getExtensionProperty(
          element,
          'startIntervalDS',
          timerEventDefinition
        ).startIntervalDS;

        if (type === 'oracleCycle' && !value) {
          return {
            startIntervalDS: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // gap interval
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'repeatIntervalDS',
      label: translate('Time until timer fires again'),
      modelProperty: 'repeatIntervalDS',
      description: translate(
        'Interval in format <br/> DAY(3) TO SECOND(0) <br/> (DDD HH:MM:SS)'
      ),

      get: function (element) {
        return cycleHelper.getExtensionProperty(
          element,
          'repeatIntervalDS',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return cycleHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value = cycleHelper.getExtensionProperty(
          element,
          'repeatIntervalDS',
          timerEventDefinition
        ).repeatIntervalDS;

        if (type === 'oracleCycle' && !value) {
          return {
            repeatIntervalDS: translate('Must provide a value'),
          };
        }
      },
    })
  );

  // repitition
  group.entries.push(
    entryFactory.textField(translate, {
      id: 'maxRuns',
      label: translate('Max Runs'),
      modelProperty: 'maxRuns',

      get: function (element) {
        return cycleHelper.getExtensionProperty(
          element,
          'maxRuns',
          timerEventDefinition
        );
      },

      set: function (element, values) {
        return cycleHelper.setExtensionProperty(
          element,
          bpmnFactory,
          values,
          timerEventDefinition
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
        var value = cycleHelper.getExtensionProperty(
          element,
          'maxRuns',
          timerEventDefinition
        ).maxRuns;

        if (type === 'oracleCycle' && !value) {
          return {
            maxRuns: translate('Must provide a value'),
          };
        }
      },
    })
  );
}

module.exports = TimerEventDefinition;
