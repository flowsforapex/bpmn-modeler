var { is } = require('bpmn-js/lib/util/ModelUtil');

import { getBusinessObject, removeExtension } from './util';

export function removeInvalidExtensionsElements(elementRegistry, modeling) {
  var elements = Object.values(elementRegistry._elements).map(e => e.element);

  elements.forEach((element) => {
    var businessObject = getBusinessObject(element);
    // filter containing allowed elements
    var filter = [];
    // explicit bo
    var bo;
    // list with extension elements to remove
    var toRemove;

    if (element.type !== 'label') {
      filter = getFilters(element);

      filter.push('apex:CustomExtension');

      bo =
        (businessObject.eventDefinitions &&
          businessObject.eventDefinitions[0]) ||
        businessObject;

      toRemove =
        bo.extensionElements &&
        bo.extensionElements.values.filter(e => !filter.includes(e.$type));

      if (toRemove && toRemove.length > 0) {
        toRemove.forEach((e) => {
          removeExtension(element, bo, e, modeling);
        });
      }
    }
  });
}

function getFilters(element) {
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
  } else if (is(element, 'bpmn:Process')) {
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
  var businessObject = getBusinessObject(element);
  // not timer event
  if (!businessObject.eventDefinitions || businessObject.eventDefinitions.length === 0) {
    return ['apex:OnEvent'];
  }
  switch (businessObject.eventDefinitions[0].timerType) {
    case 'oracleDate':
      return ['apex:OracleDate'];
    case 'oracleDuration':
      return ['apex:OracleDuration'];
    case 'oracleCycle':
      return ['apex:OracleCycle'];
    default:
      return [];
  }
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
    filter.push('apex:ExecutePlsql');
    // filter receive tasks
  } else if (is(element, 'bpmn:ReceiveTask')) {
    filter.push('apex:ExecutePlsql');
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
