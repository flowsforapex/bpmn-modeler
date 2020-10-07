import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  // Only return an entry, if the currently selected
  // element is a UserTask.

  if (is(element, 'bpmn:UserTask')) {
    
    group.entries.push(entryFactory.selectBox({
      id: 'usertask-definition-type',
      label: ('User Task Type'),
      selectOptions: [ { name: 'Apex', value: 'apex' }, { name: 'Url', value: 'url' } ],
      emptyParameter: false,
      modelProperty: 'userTaskDefinitionType'
    }));
    
    
    group.entries.push(entryFactory.textBox({
        id : 'spell',
        description : 'Apply an application',
        label : 'Application',
        modelProperty : 'spell'
    }));  
    group.entries.push(entryFactory.textBox({
        id : 'spell',
        description : 'Apply a page',
        label : 'Page',
        modelProperty : 'spell'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'spell',
      description : 'Apply a request',
      label : 'Request',
      modelProperty : 'spell'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'spell',
      description : 'Clear the Cache',
      label : 'Clear Cache',
      modelProperty : 'spell'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'spell',
      description : 'Apply an Item',
      label : 'Item',
      modelProperty : 'spell'
    }));  
    group.entries.push(entryFactory.textBox({
      id : 'spell',
      description : 'Apply a Value',
      label : 'Value',
      modelProperty : 'spell'
    }));  
  }
}