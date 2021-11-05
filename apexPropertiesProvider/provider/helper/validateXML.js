var { is } = require('bpmn-js/lib/util/ModelUtil');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

import UpdateBusinessObjectListHandler from 'bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectListHandler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export function removeInvalidExtensionsElements(
  bpmnFactory,
  canvas,
  elementRegistry
) {
  var elements = canvas.getRootElement().children;

  elements.forEach((element) => {
    var filter = [];

    if (
      is(element, 'bpmn:ExclusiveGateway') ||
      is(element, 'bpmn:ParallelGateway') ||
      is(element, 'bpmn:InclusiveGateway') ||
      is(element, 'bpmn:EventBasedGateway')
    ) {
      // opening gateway
      if (element.incoming.length === 1 && element.outgoing.length > 1) {
        filter.push('apex:BeforeSplit');
      }
      // closing gateway
      else if (element.incoming.length > 1 && element.outgoing.length === 1) {
        filter.push('apex:AfterMerge');
        // opening & closing gateway
      } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
        filter.push('apex:AfterMerge');
        filter.push('apex:BeforeSplit');
      }
    } else if (
      is(element, 'bpmn:StartEvent') ||
      is(element, 'bpmn:IntermediateThrowEvent') ||
      is(element, 'bpmn:IntermediateCatchEvent') ||
      is(element, 'bpmn:BoundaryEvent') ||
      is(element, 'bpmn:EndEvent')
    ) {
      // not timer event
      if (getBusinessObject(element).eventDefinitions === undefined) {
        filter.push('apex:OnEvent');
      }
    } else if (is(element, 'bpmn:UserTask')) {
      // TODO filter out ext Element depending on selected subtype (see typeProps)
      if (
        typeof getBusinessObject(element).type === 'undefined' ||
        getBusinessObject(element).type === 'apexPage'
      ) {
        filter.push('apex:ApexPage');
      } else if (getBusinessObject(element).type === 'externalUrl') {
        filter.push('apex:ExternalUrl');
      }
    }

    var bo = getBusinessObject(element);
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
  });
}
