import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  // Only return an entry, if the currently selected
  // element is a UserTask.

  if (is(element, 'bpmn:UserTask')) {

    group.entries.push(entryFactory.textBox({
        id : 'apex-application',
        description : 'Apply an Application',
        label : 'Application',
        modelProperty : 'apex-application'
    }));  
    group.entries.push(entryFactory.textBox({
        id : 'apex-page',
        description : 'Apply a Page',
        label : 'Page',
        modelProperty : 'apex-page'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'apex-request',
      description : 'Apply a Request',
      label : 'Request',
      modelProperty : 'apex-request'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'apex-cache',
      description : 'Clear the Cache',
      label : 'Clear Cache',
      modelProperty : 'apex-cache'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'apex-item',
      description : 'Apply an Item',
      label : 'Item',
      modelProperty : 'apex-item'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'apex-value',
      description : 'Apply a Value',
      label : 'Value',
      modelProperty : 'apex-value'
    }));  
  }
}