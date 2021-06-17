var is = require('bpmn-js/lib/util/ModelUtil').is;

import generateProcVarListProps from './procVarListProps';
import generateProcVarDetailProps from './procVarDetailProps';

export default function (element, bpmnFactory, translate) {

  var procVarProps = [];

  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {

    var listElement = generateProcVarListProps(element, bpmnFactory, {}, translate);

    listElement.entries.forEach(element => procVarProps.push(element));


    var detailProps = generateProcVarDetailProps(element, bpmnFactory, listElement, translate);

    detailProps.forEach(element => procVarProps.push(element));
  }
  
  return procVarProps;
}
