import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../extensionElements/propertiesHelper';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new propertiesHelper('apex:ApexScript');

export default function (element, bpmnFactory, commandStack, translate) {
  const serviceTaskProps = [];

  if (
    is(element, 'bpmn:ServiceTask') &&
    getBusinessObject(element).type === 'apexMail'
  ) {
  }

  return serviceTaskProps;
}
