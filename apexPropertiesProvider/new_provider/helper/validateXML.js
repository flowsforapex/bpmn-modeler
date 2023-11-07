var { is } = require('bpmn-js/lib/util/ModelUtil');
var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

import { getMessageEvent } from '../parts/message/SimpleMessageProps';
import { getBusinessObject, removeExtension } from './util';

export function removeInvalidExtensionsElements(elementRegistry, modeling) {
  var elements = Object.values(elementRegistry._elements).map(e => e.element);

  elements.forEach((element) => {
    var businessObject = getBusinessObject(element);
    // filter containing allowed elements
    var extensionFilter = [];
    // child needed for events
    var eventDefinition;
    // list with extension elements to remove
    var toRemove;
    // list with the attributes to remove
    var attributesToRemove = [];

    if (element.type !== 'label') {
      extensionFilter = getExtensionFilters(element);

      // customExtension always allowed
      extensionFilter.push('apex:CustomExtension');

      // retrieve eventDefinition
      eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0];

      // collect element which have to be removed
      toRemove =
        businessObject.extensionElements &&
        businessObject.extensionElements.values.filter(e => !extensionFilter.includes(e.$type));

      // remove extensions
      if (toRemove && toRemove.length > 0) {
        toRemove.forEach((e) => {
          removeExtension(element, businessObject, e, modeling);
        });
      }

      // if event -> remove on eventDefinition level
      if (eventDefinition) {
        toRemove =
          eventDefinition.extensionElements &&
          eventDefinition.extensionElements.values.filter(e => !extensionFilter.includes(e.$type));

        if (toRemove && toRemove.length > 0) {
          toRemove.forEach((e) => {
            removeExtension(element, eventDefinition, e, modeling);
          });
        }
      }

      attributesToRemove = getAttributesToRemove(element);

      if (attributesToRemove && attributesToRemove.length > 0) {
        attributesToRemove.forEach((e) => {
          if (businessObject.get(e)) {
            modeling.updateModdleProperties(element, businessObject, {
              [e]: null,
            });
          }
        });
      }
    }
  });
}

function getAttributesToRemove(element) {
  var filter = [];
  if (
    !ModelingUtil.isAny(element, [
      'bpmn:UserTask',
      'bpmn:ServiceTask',
      'bpmn:ScriptTask',
      'bpmn:BusinessRuleTask',
      'bpmn:SendTask',
      'bpmn:ReceiveTask',
    ]) &&
    !(is(element, 'bpmn:IntermediateThrowEvent') && getMessageEvent(element)) &&
    !(is(element, 'bpmn:IntermediateCatchEvent') && getMessageEvent(element)) &&
    !(is(element, 'bpmn:StartEvent') && getMessageEvent(element)) &&
    !(is(element, 'bpmn:EndEvent') && getMessageEvent(element)) &&
    !(is(element, 'bpmn:BoundaryEvent') && getMessageEvent(element))
  ) {
    filter.push('apex:type');
  }
  if (
    !is(element, 'bpmn:CallActivity') &&
    !is(element, 'bpmn:Process') &&
    !(is(element, 'bpmn:UserTask') && getBusinessObject(element).type === 'apexPage') &&
    !(is(element, 'bpmn:UserTask') && getBusinessObject(element).type === 'apexApproval') &&
    !(is(element, 'bpmn:ServiceTask') && getBusinessObject(element).type === 'sendMail')
  ) {
    filter.push('apex:manualInput');
  }
  return filter;
}

function getExtensionFilters(element) {
  // filter gateways
  if (
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway')
  ) {
    return getGatewayFilters(element);
    // filter events
  } else if (
    is(element, 'bpmn:StartEvent') ||
    is(element, 'bpmn:IntermediateThrowEvent') ||
    is(element, 'bpmn:IntermediateCatchEvent') ||
    is(element, 'bpmn:BoundaryEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    return getEventFilters(element);
    // filter tasks
  } else if (is(element, 'bpmn:Task')) {
    return getTaskFilters(element);
    // filter call activites
  } else if (is(element, 'bpmn:CallActivity')) {
    return getCallActivityFilters();
    // filter processes
  } else if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    return getProcessFilters(element);
  }

  return [];
}

function getGatewayFilters(element) {
  // opening gateway
  if (element.incoming.length === 1 && element.outgoing.length > 1) {
    return ['apex:BeforeSplit'];
    // closing gateway
  } else if (element.incoming.length > 1 && element.outgoing.length === 1) {
    return ['apex:AfterMerge'];
    // opening & closing gateway
  } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
    return ['apex:AfterMerge', 'apex:BeforeSplit'];
  }

  return [];
}

function getEventFilters(element) {
  var filter = [];
  var businessObject = getBusinessObject(element);

  filter.push('apex:OnEvent');

  if (businessObject.eventDefinitions && businessObject.eventDefinitions[0]) {
    if (is(businessObject.eventDefinitions[0], 'bpmn:TimerEventDefinition')) {    
      
      filter.push('apex:BeforeEvent');

      switch (businessObject.eventDefinitions[0].timerType) {
        case 'oracleDate':
          filter.push('apex:OracleDate');
          break;
        case 'oracleDuration':
          filter.push('apex:OracleDuration');
          break;
        case 'oracleCycle':
          filter.push('apex:OracleCycle');
          break;
        default:
          // do nothing
      }
    } else if (is(businessObject.eventDefinitions[0], 'bpmn:MessageEventDefinition')) {
      if (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')) {
        filter.push('apex:Endpoint');
        filter.push('apex:MessageName');
        filter.push('apex:CorrelationKey');
        filter.push('apex:CorrelationValue');
        filter.push('apex:Payload');
      } else if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:StartEvent') || is(element, 'bpmn:BoundaryEvent')) {
        filter.push('apex:MessageName');
        filter.push('apex:CorrelationKey');
        filter.push('apex:CorrelationValue');
        filter.push('apex:PayloadVariable');
      }
    }
  }

  return filter;
}

function getTaskFilters(element) {
  var filter = [];
  var businessObject = getBusinessObject(element);

  filter.push('apex:BeforeTask');
  filter.push('apex:AfterTask');

  // filter user tasks
  if (is(element, 'bpmn:UserTask')) {
    // assignment
    filter.push('apex:PotentialUsers');
    filter.push('apex:PotentialGroups');
    filter.push('apex:ExcludedUsers');
    // scheduling
    filter.push('apex:Priority');
    filter.push('apex:DueOn');

    switch (businessObject.type) {
      case 'apexPage':
        filter.push('apex:ApexPage');
        break;
      case 'externalUrl':
        filter.push('apex:ExternalUrl');
        break;
      case 'apexApproval':
        filter.push('apex:ApexApproval');
        break;
      default:
      // do nothing
    }
    // filter script tasks
  } else if (is(element, 'bpmn:ScriptTask')) {
    filter.push('apex:ExecutePlsql');
    // filter service tasks
  } else if (is(element, 'bpmn:ServiceTask')) {
    switch (businessObject.type) {
      case 'executePlsql':
        filter.push('apex:ExecutePlsql');
        break;
      case 'sendMail':
        filter.push('apex:SendMail');
        break;
      default:
      // do nothing
    }
    // filter business rule tasks
  } else if (is(element, 'bpmn:BusinessRuleTask')) {
    filter.push('apex:ExecutePlsql');
    // filter send tasks
  } else if (is(element, 'bpmn:SendTask')) {
    switch (businessObject.type) {
      case 'executePlsql':
        filter.push('apex:ExecutePlsql');
        break;
      case 'simpleMessage':
        filter.push('apex:Endpoint');
        filter.push('apex:MessageName');
        filter.push('apex:CorrelationKey');
        filter.push('apex:CorrelationValue');
        filter.push('apex:Payload');
        break;
      default:
      // do nothing
    }
    // filter receive tasks
  } else if (is(element, 'bpmn:ReceiveTask')) {
    switch (businessObject.type) {
      case 'executePlsql':
        filter.push('apex:ExecutePlsql');
        break;
      case 'simpleMessage':
        filter.push('apex:MessageName');
        filter.push('apex:CorrelationKey');
        filter.push('apex:CorrelationValue');
        filter.push('apex:PayloadVariable');
        break;
      default:
      // do nothing
    }
  }
  return filter;
}

function getCallActivityFilters() {
  var filter = [];

  filter.push('apex:InVariables');
  filter.push('apex:OutVariables');

  return filter;
}

function getProcessFilters(element) {
  var filter = [];
  var businessObject = getBusinessObject(element);

  filter.push('apex:Priority');
  filter.push('apex:DueOn');

  if (businessObject.isCallable === 'true') {
    filter.push('apex:InVariables');
    filter.push('apex:OutVariables');
  }

  if (businessObject.isStartable === 'true') {
    filter.push('apex:PotentialStartingUsers');
    filter.push('apex:PotentialStartingGroups');
    filter.push('apex:ExcludedStartingUsers');
  }

  return filter;
}
