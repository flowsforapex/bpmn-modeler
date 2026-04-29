import Ids from 'ids';

import { getBusinessObject as getBO, is } from 'bpmn-js/lib/util/ModelUtil';

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}

export function getBusinessObject(element) {

  return (is(element, 'bpmn:Participant') && getBO(element).processRef) ? getBO(element).processRef : getBO(element);
}

export function isChildOf(element, type) {

  const businessObject = getBusinessObject(element);

  const parent = businessObject.$parent;

  if (parent) {
    
    if (is(parent, type)) return true;

    return isChildOf(parent, type);
  }

  return false;
}
