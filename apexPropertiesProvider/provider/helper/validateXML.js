var { is } = require('bpmn-js/lib/util/ModelUtil');
var ModelingUtil = require('bpmn-js/lib/util/ModelUtil');

import { getMessageEvent } from '../parts/message/SimpleMessageProps';
import { adHocSubProcessExtensions, businessRuleTaskExtensions, callActivityExtensions, eventExtensions, gatewayExtensions, processExtensions, receiveTaskExtensions, scriptTaskExtensions, sendTaskExtensions, serviceTaskExtensions, subProcessExtensions, taskExtensions, userTaskExtensions } from './rules-config';
import { getBusinessObject } from './util';

import { removeExtension } from './extensions';

const rulesConfig = {
  'bpmn:Gateway': gatewayExtensions,
  'bpmn:Task': taskExtensions,
  'bpmn:UserTask': userTaskExtensions,
  'bpmn:ScriptTask': scriptTaskExtensions,
  'bpmn:ServiceTask': serviceTaskExtensions,
  'bpmn:BusinessRuleTask': businessRuleTaskExtensions,
  'bpmn:SendTask': sendTaskExtensions,
  'bpmn:ReceiveTask': receiveTaskExtensions,
  'bpmn:CallActivity': callActivityExtensions,
  'bpmn:Event': eventExtensions,
  'bpmn:Process': processExtensions,
  'bpmn:Participant': processExtensions,
  'bpmn:SubProcess': subProcessExtensions,
  'bpmn:AdHocSubProcess': adHocSubProcessExtensions
}

function executeRules(element) {
  
  const businessObject = getBusinessObject(element);
  
  // Custom extension is always allowed
  let allowedExtensions = ['apex:CustomExtension'];

  // loop over rules
  Object.entries(rulesConfig)
  // filter by element type
  .filter(([type, _]) => is(element, type) || is(getBusinessObject(element), type))
  .forEach(([, config]) => {
    // get list of allowed extensions
    allowedExtensions = [...allowedExtensions, ...(config(element, businessObject) || [])];
  });

  return new Set(allowedExtensions);
}

function removeExtensions(element, businessObject, extensions, modeling) {
  if (!businessObject.extensionElements) return;

  const toRemove = businessObject.extensionElements.values.filter(e => !extensions.has(e.$type));

  toRemove.forEach(r => removeExtension(element, businessObject, r, modeling));
}

export function removeInvalidExtensionsElements(elementRegistry, modeling) {
  var elements = Object.values(elementRegistry._elements).map(e => e.element);

  elements.forEach((element) => {
    
    if (element.type === 'label') return;

    const businessObject = getBusinessObject(element);

    const extensions = executeRules(element);
    removeExtensions(element, businessObject, extensions, modeling);

    const eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0];
    if (eventDefinition) removeExtensions(element, eventDefinition, extensions, modeling);

    const { loopCharacteristics } = businessObject;
    if (loopCharacteristics) removeExtensions(element, loopCharacteristics, extensions, modeling);

    removeInvalidAttributes(element, businessObject, modeling);
  });
}

function removeInvalidAttributes(element, businessObject, modeling) {
  const attributes = [];

  if (
    !(
      ModelingUtil.isAny(element, [ 'bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:ScriptTask', 'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:ReceiveTask' ]) ||
      (
        ModelingUtil.isAny(element, [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:BoundaryEvent' ])
        &&
        getMessageEvent(element)
      )
    )
  ) attributes.push('apex:type');
  
  if (
    !(
      ModelingUtil.isAny(element, [ 'bpmn:CallActivity', 'bpmn:Process', 'bpmn:AdHocSubProcess' ])
      || (is(element, 'bpmn:UserTask') && businessObject.type === 'apexPage')
      || (is(element, 'bpmn:UserTask') && businessObject.type === 'apexApproval')
      || (is(element, 'bpmn:UserTask') && businessObject.type === 'apexSimpleForm')
      || (is(element, 'bpmn:ServiceTask') && businessObject.type === 'sendMail')
    )
  ) attributes.push('apex:manualInput');
  
  attributes.forEach((e) => {
    if (!businessObject.isImplicit && businessObject.get(e)) {
      modeling.updateModdleProperties(element, businessObject, { [e]: null });
    }
  });
}