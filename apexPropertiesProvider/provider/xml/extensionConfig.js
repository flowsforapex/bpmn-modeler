import { is, isAny } from "bpmn-js/lib/util/ModelUtil";

import { isChildOf } from "../helper/util";

export function gatewayExtensions(e, bo) {
  // opening gateway
  if (e.incoming.length === 1 && e.outgoing.length > 1) return ['apex:BeforeSplit'];
  // closing gateway
  if (e.incoming.length > 1 && e.outgoing.length === 1) return ['apex:AfterMerge'];
  // opening & closing gateway
  if (e.incoming.length > 1 && e.outgoing.length > 1) return ['apex:AfterMerge', 'apex:BeforeSplit'];
  // default
  return [];
};

export function taskExtensions(e, bo) {
  const extensions = ['apex:InputParameters', 'apex:OutputParameters', 'apex:Subject', 'apex:Description'];
  
  if (bo.loopCharacteristics) {
    extensions.push('apex:OutputCollection');
    extensions.push('apex:CompletionCondition');

    if (!is(bo.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) {
      extensions.push('apex:InputCollection');
    }
  }
  else {
    extensions.push('apex:BeforeTask');
    extensions.push('apex:AfterTask');
  }

  if(isChildOf(e, 'bpmn:AdHocSubProcess')) {
    extensions.push('apex:IsRepeatable');
    extensions.push('apex:DisplayOrder');
    extensions.push('apex:Grouping');
    extensions.push('apex:StartCondition');
  }

  return extensions;
}
  
export function userTaskExtensions(e, bo) {
  const extensions = ['apex:PotentialUsers', 'apex:ExcludedUsers', 'apex:Priority', 'apex:DueOn'];

  switch (bo.type) {
    case 'apexPage':
      extensions.push('apex:ApexPage');
      extensions.push('apex:PotentialGroups');
      break;
    case 'apexApproval':
      extensions.push('apex:ApexApproval');
      extensions.push('apex:BusinessAdmin');
      break;
    case 'apexSimpleForm':
      extensions.push('apex:ApexSimpleForm');
      extensions.push('apex:PotentialGroups');
      break;
    default:
    // do nothing
  }

  return extensions;
}

export function scriptTaskExtensions(e, bo) {
  return ['apex:ExecutePlsql','apex:AsyncBefore','apex:AsyncAfter'];
}

export function serviceTaskExtensions(e, bo) {
  const extensions = ['apex:AsyncBefore','apex:AsyncAfter'];
  
  switch (bo.type) {
    case 'executePlsql':
      extensions.push('apex:ExecutePlsql');
      break;
    case 'sendMail':
      extensions.push('apex:SendMail');
      break;
    case 'apexAIGeneration':
      extensions.push('apex:AiService');
      extensions.push('apex:AiTemperature');
      extensions.push('apex:AiPrompt');
      extensions.push('apex:ResultVariable');
      break;
    default:
    // do nothing
  }

  return extensions;
}

export function businessRuleTaskExtensions(e, bo) {
  return ['apex:ExecutePlsql'];
}

export function sendTaskExtensions(e, bo) {
  const extensions = [];
  
  switch (bo.type) {
    case 'executePlsql':
    extensions.push('apex:ExecutePlsql');
    break;
  case 'simpleMessage':
    extensions.push('apex:Endpoint');
    extensions.push('apex:MessageName');
    extensions.push('apex:CorrelationKey');
    extensions.push('apex:CorrelationValue');
    extensions.push('apex:Payload');
    break;
  default:
    // do nothing
  }

  return extensions;
}

export function receiveTaskExtensions(e, bo) {
  const extensions = [];
  
  switch (bo.type) {
    case 'executePlsql':
    extensions.push('apex:ExecutePlsql');
    break;
  case 'simpleMessage':
    extensions.push('apex:MessageName');
    extensions.push('apex:CorrelationKey');
    extensions.push('apex:CorrelationValue');
    extensions.push('apex:PayloadVariable');
    break;
  default:
    // do nothing
  }

  return extensions;
}

export function callActivityExtensions(e, bo) {
  return ['apex:InVariables', 'apex:OutVariables'];
}

export function eventExtensions(e, bo) {
  const extensions = ['apex:OnEvent'];

  if (is(e, 'bpmn:StartEvent')) {
    extensions.push('apex:InputParameters');
    extensions.push('apex:OutputParameters');
  }

  const eventDefinition = bo.eventDefinitions && bo.eventDefinitions[0];

  if (eventDefinition && is(eventDefinition, 'bpmn:TimerEventDefinition')) {
      
      extensions.push('apex:BeforeEvent');

      switch (eventDefinition.timerType) {
        case 'oracleDate':
          extensions.push('apex:OracleDate');
          break;
        case 'oracleDuration':
          extensions.push('apex:OracleDuration');
          break;
        case 'oracleCycle':
          extensions.push('apex:OracleCycle');
          break;
        default:
          // do nothing
      }
    } else if (eventDefinition && is(eventDefinition, 'bpmn:MessageEventDefinition')) {
      if (isAny(e, ['bpmn:IntermediateThrowEvent', 'bpmn:EndEvent'])) {
        extensions.push('apex:Endpoint');
        extensions.push('apex:MessageName');
        extensions.push('apex:CorrelationKey');
        extensions.push('apex:CorrelationValue');
        extensions.push('apex:Payload');
      } else if (isAny(e, ['bpmn:IntermediateCatchEvent', 'bpmn:StartEvent', 'bpmn:BoundaryEvent'])) {
        extensions.push('apex:MessageName');
        extensions.push('apex:CorrelationKey');
        extensions.push('apex:CorrelationValue');
        extensions.push('apex:PayloadVariable');
      }
    }
  
  return extensions;
}

export function processExtensions(e, bo) {
  const extensions = ['apex:Priority', 'apex:DueOn'];

  if (bo.isCallable === 'true') {
    extensions.push('apex:InVariables');
    extensions.push('apex:OutVariables');
  }

  if (bo.isStartable === 'true') {
    extensions.push('apex:PotentialStartingUsers');
    extensions.push('apex:PotentialStartingGroups');
    extensions.push('apex:ExcludedStartingUsers');
  }

  return extensions;
}

export function subProcessExtensions(e, bo) {
  const extensions = [];
  
  if (bo.loopCharacteristics) {
    extensions.push('apex:Description');
    extensions.push('apex:OutputCollection');
    extensions.push('apex:CompletionCondition');

    if (!is(bo.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) {
      extensions.push('apex:InputCollection');
    }
  }
  
  return extensions;
}

export function adHocSubProcessExtensions(e, bo) {
  return [
    'apex:Subject',
    'apex:Control',
    'apex:AiInterface',
    'apex:AiService',
    'apex:AiProvider',
    'apex:AiModel',
    'apex:Objective',
    'apex:Interval',
    'apex:TurnsPerSession',
    'apex:MaxTotalTurns',
    'apex:ProcVarsToSubmit',
    'apex:StartingActivities',
    'apex:CompletionCondition',
    'apex:TaskVisibility',
    'apex:ApexPage',
    'apex:Priority',
    'apex:DueOn',
    'apex:PotentialUsers',
    'apex:PotentialGroups',
    'apex:ExcludedUsers',
  ];
}