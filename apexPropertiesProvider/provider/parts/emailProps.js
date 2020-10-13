import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  // Only return an entry, if the currently selected
  // element is a ServiceTask.

  if (is(element, 'bpmn:ServiceTask')) {
    
    group.entries.push(entryFactory.textBox({
        id : 'insertEmail',
        description : 'Apply an email',
        label : 'Email',
        modelProperty : 'insertEmail'
      }));
   
        
  }
}