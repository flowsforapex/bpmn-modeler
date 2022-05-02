var { is } = require('bpmn-js/lib/util/ModelUtil');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

import UpdateBusinessObjectListHandler from 'bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectListHandler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export function removeInvalidExtensionsElements(bpmnFactory, elementRegistry) {
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

      bo =
        (businessObject.eventDefinitions &&
          businessObject.eventDefinitions[0]) ||
        businessObject;
      toRemove =
        bo.extensionElements &&
        bo.extensionElements.values.filter(e => !filter.includes(e.$type));

      if (toRemove && toRemove.length > 0) {
        toRemove.forEach((e) => {
          var command = extensionElementsHelper.removeEntry(bo, element, e);
          new UpdateBusinessObjectListHandler(
            elementRegistry,
            bpmnFactory
          ).execute(command.context);
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
  if (typeof businessObject.eventDefinitions === 'undefined') {
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
    // filter call activity tasks
  } else if (is(element, 'bpmn:CallActivity')) {
    filter.push('apex:InVariables');
    filter.push('apex:OutVariables');
  }
  return filter;
}
