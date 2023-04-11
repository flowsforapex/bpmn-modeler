import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  NumberFieldEntry,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import ExtensionHelper from '../../helper/ExtensionHelper';

import { getBusinessObject } from '../../helper/util';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil');
var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');
var minDash = require('min-dash');

var dateHelper = new ExtensionHelper('apex:OracleDate');
var durationHelper = new ExtensionHelper('apex:OracleDuration');
var cycleHelper = new ExtensionHelper('apex:OracleCycle');

export default function (args) {

  const {element} = args;
  
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
      {
        id: 'intervalYM',
        element,
        component: IntervalYM,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'intervalDS',
        element,
        component: IntervalDS,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'startIntervalDS',
        element,
        component: StartIntervalDS,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'repeatIntervalDS',
        element,
        component: RepeatIntervalDS,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
      {
        id: 'maxRuns',
        element,
        component: MaxRuns,
        isEdited: isTextFieldEntryEdited,
        timerEventDefinition,
        timerEventDefinitionType
      },
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
  const businessObject = getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  
  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, 'bpmn:TimerEventDefinition');
  });
}

function TimerDefinitionType(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const businessObject = getBusinessObject(element);

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

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

    modeling.updateModdleProperties(element, timerEventDefinition, newProps);
  };
  
  const getOptions = () => {
    if (
      element.type === 'bpmn:StartEvent' ||
      element.type === 'bpmn:IntermediateCatchEvent' ||
      (element.type === 'bpmn:BoundaryEvent' &&
      businessObject.cancelActivity)
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

  console.log(timerEventDefinition);
  console.log(timerEventDefinitionType);

  const timerEventFormalExpression = timerEventDefinitionType && timerEventDefinition.get(timerEventDefinitionType);

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const getValue = () => timerEventFormalExpression && timerEventFormalExpression.get('body');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, timerEventFormalExpression, {
      body: value,
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

function IntervalYM(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => durationHelper.getExtensionProperty(timerEventDefinition, 'intervalYM');

  const setValue = (value) => {
    durationHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      intervalYM: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleDuration') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Timer Duration'),
      description: translate('in format YY-MM'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function IntervalDS(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => durationHelper.getExtensionProperty(timerEventDefinition, 'intervalDS');

  const setValue = (value) => {
    durationHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      intervalDS: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleDuration') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: '',
      description: translate('in format DDD HH:MM:SS'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function StartIntervalDS(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => cycleHelper.getExtensionProperty(timerEventDefinition, 'startIntervalDS');

  const setValue = (value) => {
    cycleHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      startIntervalDS: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleCycle') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Time until the timer fires first'),
      description: translate('in format DDD HH:MM:SS'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function RepeatIntervalDS(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => cycleHelper.getExtensionProperty(timerEventDefinition, 'repeatIntervalDS');

  const setValue = (value) => {
    cycleHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      repeatIntervalDS: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleCycle') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Time until the timer fires again'),
      description: translate('in format DDD HH:MM:SS'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function MaxRuns(props) {
  const { element, id, timerEventDefinition, timerEventDefinitionType } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => cycleHelper.getExtensionProperty(timerEventDefinition, 'maxRuns');

  const setValue = (value) => {
    cycleHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      maxRuns: value,
    }, timerEventDefinition);
  };

  if (timerEventDefinitionType === 'oracleCycle') {
    return new NumberFieldEntry({
      id: id,
      element: element,
      label: translate('Max Runs'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}