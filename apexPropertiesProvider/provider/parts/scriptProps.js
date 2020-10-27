import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  // Only return an entry, if the currently selected
  // element is a ScriptTask.

  if (is(element, 'bpmn:ScriptTask')) {
    
    group.entries.push(entryFactory.textField({
        id : 'insertScript',
        description : 'Apply a script',
        label : 'Script',
        modelProperty : 'insertScript'
      }));
   
        
  }
}