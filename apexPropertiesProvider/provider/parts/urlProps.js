import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import utils from 'bpmn-js-properties-panel/lib/Utils'
import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  // Only return an entry, if the currently selected
  // element is a UserTask.

  if (is(element, 'bpmn:UserTask')) {

    group.entries.push(entryFactory.textBox({
        id : 'spell',
        description : 'Apply an url',
        label : 'URL',
        modelProperty : 'spell'
    }));  
  }
}