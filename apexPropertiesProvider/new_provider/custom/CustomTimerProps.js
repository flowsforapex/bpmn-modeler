import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import ExtensionHelper from '../helper/ExtensionHelper';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil');
var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');
var minDash = require('min-dash');

var dateHelper = new ExtensionHelper('apex:OracleDate');
var durationHelper = new ExtensionHelper('apex:OracleDuration');
var cycleHelper = new ExtensionHelper('apex:OracleCycle');

export default function (element, injector) {
  const timerEventDefinition = getTimerEventDefinition(element);
  const timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  if (isTimerSupported(element)) {
    return [
      {
        id: 'timerDefinitionType',
        element,
        component: TimerDefinitionType,
        isEdited: isSelectEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'timerDefinition',
        element,
        component: TimerDefinition,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'dateString',
        element,
        component: DateString,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'formatMask',
        element,
        component: FormatMask,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      // {
      //   id: 'timerDuration1',
      //   element,
      //   component: TimerDuration1,
      //   isEdited: isTextFieldEntryEdited
      // },
      // {
      //   id: 'timerDuration2',
      //   element,
      //   component: TimerDuration2,
      //   isEdited: isTextFieldEntryEdited
      // },
      // {
      //   id: 'cycleFirst',
      //   element,
      //   component: CycleFirst,
      //   isEdited: isTextFieldEntryEdited
      // },
      // {
      //   id: 'cycleAgain',
      //   element,
      //   component: CycleAgain,
      //   isEdited: isTextFieldEntryEdited
      // },
      // {
      //   id: 'maxRuns',
      //   element,
      //   component: MaxRuns,
      //   isEdited: isTextFieldEntryEdited
      // },
    ];
  }
  return [];
}

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

function isTimerSupported(element) {
  return ModelingUtil.isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']) && !!getTimerEventDefinition(element);
}

function getTimerEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition');
}
function getEventDefinition(element, eventType) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, eventType);
  });
}

function TimerDefinitionType(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  const getValue = () => timerEventDefinitionType || '';

  const setValue = (value) => {
    
    if (value === timerEventDefinitionType) {
      return;
    }

    const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
      body: undefined
    });
    formalExpression.$parent = timerEventDefinition;

    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined,
      timerType: undefined,
    };

    if (['oracleDate', 'oracleDuration', 'oracleCycle'].includes(value)) {
      newProps.timerType = value;
    } else {
      newProps[value] = formalExpression;
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });

  };
  
  const getOptions = () => {
    if (
      element.type === 'bpmn:StartEvent' ||
      element.type === 'bpmn:IntermediateCatchEvent' ||
      (element.type === 'bpmn:BoundaryEvent' &&
        element.businessObject.cancelActivity)
    ) {
      return [
        { value: 'oracleDate', label: translate('Date (Oracle)') },
        { value: 'oracleDuration', label: translate('Duration (Oracle)') },
        { value: 'timeDate', label: translate('Date (ISO 8601)') },
        { value: 'timeDuration', label: translate('Duration (ISO 8601)') },
      ];
    } 
      return [
        { value: 'oracleDate', label: translate('Date (Oracle)') },
        { value: 'oracleDuration', label: translate('Duration (Oracle)') },
        { value: 'oracleCycle', label: translate('Cycle (Oracle)') },
        { value: 'timeDate', label: translate('Date (ISO 8601)') },
        { value: 'timeDuration', label: translate('Duration (ISO 8601)') },
        { value: 'timeCycle', label: translate('Cycle (ISO 8601)') },
      ];
    
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Timer Definition Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: getOptions
  });
}

function TimerDefinition(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');

  const getValue = () => timerEventFormalExpression && timerEventFormalExpression.get('body');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };

  if (['timeDate', 'timeDuration', 'timeCycle'].includes(timerEventDefinitionType)) {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Timer Definition'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function DateString(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => dateHelper.getExtensionProperty(timerEventDefinition, 'date');

  const setValue = (value) => {
    dateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      date: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleDate') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Date String'),
      description: translate('e.g. 23-JUN-2027 14:10:00'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function FormatMask(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => dateHelper.getExtensionProperty(timerEventDefinition, 'formatMask');

  const setValue = (value) => {
    dateHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      formatMask: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleDate') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('FormatMask'),
      description: translate('e.g. DD-MON-YYYY HH24:MI:SS'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}