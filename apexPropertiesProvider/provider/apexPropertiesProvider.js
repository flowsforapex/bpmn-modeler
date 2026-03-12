
import { setDefaultSequence } from './parts/sequenceFlow/SequenceFlowProps';

import {
  businessRuleTaskSections,
  callActivitySections,
  customExtensionSections,
  endEventSections,
  eventSections,
  gatewaySections,
  laneSections,
  manualTaskSections,
  processSections,
  receiveTaskSections,
  scriptTaskSections,
  sendTaskSections,
  sequenceFlowSections,
  serviceTaskSections,
  startEventSections,
  subProcessSections,
  taskSections,
  userTaskSections
} from './section-config';

import { is, isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getBusinessObject } from './helper/util';

const LOW_PRIORITY = 500;
export default function apexPropertiesProvider(
  propertiesPanel,
  injector,
  eventBus,
  modeling,
  elementRegistry,
  translate,
  showCustomExtensions
) {
  // eventBus.on('saveXML.start', function () {
  //   removeInvalidExtensionsElements(elementRegistry, modeling);
  // });

  // TODO test if needed
  // eventBus.on('connection.added', function (event) {
  //   setDefaultSequence(event.element, modeling);
  // });

  eventBus.on('commandStack.connection.create.postExecute', function (event) {
    setDefaultSequence(event.context.connection, modeling);
  });

  this.getGroups = function(element) {
    return function(groups) {
      
      // helper function to add a section of properties
      const addSection = (config) => {

        config.forEach(c => {

          // if element not in exclude list
          if (!c.exclude || !isAny(element, c.exclude)) {

            // get entries
            const entries = c.props({ element, injector, translate });
            
            // if entries existing
            if (entries.length > 0) {

              // append to general group
              if (c.id === 'general') {
                const generalGroup = groups.find(g => g.id === 'general');
                generalGroup.entries = generalGroup.entries.concat(entries);
              }
              // create new group
              else {
                const label = typeof c.label === 'function' ? translate(c.label(element)) : c.label ? translate(c.label) : null;
                
                groups.push({ id: c.id, label: label, entries: entries });
              }
            }
          }
        })
      };

      // mapping object between element types and property configurations
      const sectionConfigs = {
        'bpmn:Task': taskSections,
        'bpmn:UserTask': userTaskSections,
        'bpmn:ScriptTask': scriptTaskSections,
        'bpmn:ServiceTask': serviceTaskSections,
        'bpmn:BusinessRuleTask': businessRuleTaskSections,
        'bpmn:SendTask': sendTaskSections,
        'bpmn:ReceiveTask': receiveTaskSections,
        'bpmn:ManualTask': manualTaskSections,
        'bpmn:CallActivity': callActivitySections,
        'bpmn:Process': processSections,
        'bpmn:SubProcess': subProcessSections,
        'bpmn:IntermediateCatchEvent': eventSections,
        'bpmn:IntermediateThrowEvent': eventSections,
        'bpmn:BoundaryEvent': eventSections,
        'bpmn:Lane': laneSections,
        'bpmn:Gateway': gatewaySections,
        'bpmn:SequenceFlow': sequenceFlowSections,
        'bpmn:StartEvent': startEventSections,
        'bpmn:EndEvent': endEventSections,
      };

      // loop over mapping and add all relevant sections
      Object.entries(sectionConfigs)
      .filter(([type, _]) => is(element, type) || is(getBusinessObject(element), type))
      .forEach(([, config]) => addSection(config));

      // add custom section
      if (showCustomExtensions) addSection(customExtensionSections);

      // remove default bpmn groups
      const removeGroups = ['timer', 'message', 'multiInstance', 'adHocCompletion'];
      
      const filteredGroups = groups.filter(g => !removeGroups.includes(g.id));

      return filteredGroups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

apexPropertiesProvider.$inject = [
  'propertiesPanel',
  'injector',
  'eventBus',
  'modeling',
  'elementRegistry',
  'translate',
  'config.showCustomExtensions'
];
