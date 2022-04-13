var { is } = require('bpmn-js/lib/util/ModelUtil');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

import UpdateBusinessObjectListHandler from 'bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectListHandler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export function removeInvalidExtensionsElements(bpmnFactory, elementRegistry) {
  var elements = Object.values(elementRegistry._elements).map(e => e.element);

  elements.forEach((element) => {
    var businessObject = getBusinessObject(element);
    var filter = [];
    var parent;

    if (element.type !== 'label') {
      // filter gateways
      if (
        is(element, 'bpmn:ExclusiveGateway') ||
        is(element, 'bpmn:ParallelGateway') ||
        is(element, 'bpmn:InclusiveGateway') ||
        is(element, 'bpmn:EventBasedGateway')
      ) {
        // opening gateway
        if (element.incoming.length === 1 && element.outgoing.length > 1) {
          filter.push('apex:BeforeSplit');
          // closing gateway
        } else if (
          element.incoming.length > 1 &&
          element.outgoing.length === 1
        ) {
          filter.push('apex:AfterMerge');
          // opening & closing gateway
        } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
          filter.push('apex:AfterMerge');
          filter.push('apex:BeforeSplit');
        }
        // filter events
      } else if (
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:IntermediateThrowEvent') ||
        is(element, 'bpmn:IntermediateCatchEvent') ||
        is(element, 'bpmn:BoundaryEvent') ||
        is(element, 'bpmn:EndEvent')
      ) {
        // not timer event
        if (typeof businessObject.eventDefinitions === 'undefined') {
          filter.push('apex:OnEvent');
        } else {
          parent = businessObject.eventDefinitions[0];
          if (parent.timerType === 'oracleDate') {
            filter.push('apex:OracleDate');
          } else if (parent.timerType === 'oracleDuration') {
            filter.push('apex:OracleDuration');
          } else if (parent.timerType === 'oracleCycle') {
            filter.push('apex:OracleCycle');
          }
        }
        // filter tasks
      } else if (is(element, 'bpmn:Task')) {
        filter.push('apex:BeforeTask');
        filter.push('apex:AfterTask');
        // filter user tasks
        if (is(element, 'bpmn:UserTask')) {
          if (
            typeof businessObject.type === 'undefined' ||
            businessObject.type === 'apexPage'
          ) {
            filter.push('apex:ApexPage');
          } else if (businessObject.type === 'externalUrl') {
            filter.push('apex:ExternalUrl');
          }
          // filter script tasks
        } else if (is(element, 'bpmn:ScriptTask')) {
          filter.push('apex:ExecutePlsql');
          // filter service tasks
        } else if (is(element, 'bpmn:ServiceTask')) {
          if (
            typeof getBusinessObject(element).type === 'undefined' ||
            getBusinessObject(element).type === 'executePlsql'
          ) {
            filter.push('apex:ExecutePlsql');
          } else if (getBusinessObject(element).type === 'sendMail') {
            filter.push('apex:SendMail');
          }
          // filter business rule tasks
        } else if (is(element, 'bpmn:BusinessRuleTask')) {
          filter.push('apex:ExecutePlsql');
        }
      } else if (is(element, 'bpmn:CallActivity')) {
        filter.push('apex:IntoCalledActivity');
        filter.push('apex:CalledActivityReturns');
      }

      var bo = parent || businessObject;
      var toRemove =
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
