import { getBusinessObject as getBO, is } from 'bpmn-js/lib/util/ModelUtil';

export function getBusinessObject(element) {
  return is(element, 'bpmn:Participant') ? getBO(element).processRef : getBO(element);
}
