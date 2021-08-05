// eslint-disable-next-line import/no-extraneous-dependencies
import inherits from 'inherits';
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import eventProps from './parts/events/EventProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';

// Require your custom property entries.
import globalProps from './parts/globalProps.js';
import generateUserTaskEntries from './parts/userTaskProps.js';
import generateScriptTaskEntries from './parts/scriptTaskProps.js';
import generateServiceTaskEntries from './parts/serviceTaskProps.js';

import generateUserTaskProcessVariableLists from './parts/process_variables/taskProcVarProps.js';
import generateGatewayTaskProcessVariableLists from './parts/process_variables/gatewayProcVarProps.js';
import generateEventTaskProcessVariables from './parts/process_variables/eventProcVarProps.js';

import { procVarDetailProps } from './parts/process_variables/procVarDetailProps.js';
import  { isSelected } from './parts/process_variables/procVarLists.js';

import { removeInvalidExtensionsElements } from './parts/process_variables/helper/validateXML';

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {
  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  var detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: []
  };
  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };

  globalProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return [
    generalGroup,
    detailsGroup,
    documentationGroup
  ];
}

function createApexTabGroups(element, translate) {
  var apexPageGroup = {
    id: 'apex-page-calls',
    label: 'Call APEX Page',
    entries: generateUserTaskEntries(element, translate)
  };
  var apexScriptGroup = {
    id: 'apex-script-group',
    label: 'Script Task',
    entries: generateScriptTaskEntries(element, translate)
  };
  var apexServiceGroup = {
    id: 'apex-service-group',
    label: 'Service Task',
    entries: generateServiceTaskEntries(element, translate)
  };

  return [
    apexPageGroup,
    apexScriptGroup,
    apexServiceGroup
  ];
}

function createVariablesTabGroup(element, bpmnFactory, elementRegistry, translate) {

  var taskGroup = {
    id: 'apex-task',
    label: 'Process Variables',
    entries: generateUserTaskProcessVariableLists(element, bpmnFactory, elementRegistry, translate)
  };

  var gatewayGroup = {
    id: 'apex-gateway',
    label: 'Process Variables',
    entries: generateGatewayTaskProcessVariableLists(element, bpmnFactory, elementRegistry, translate)
  };

  var eventGroup = {
    id: 'apex-event',
    label: 'Process Variables',
    entries: generateEventTaskProcessVariables(element, bpmnFactory, elementRegistry, translate)
  }

  var detailGroup = {
    id: 'details',
    label: 'Variable Details',
    entries: procVarDetailProps(element, bpmnFactory, translate),
    enabled: isSelected
  }

  return [
    taskGroup,
    gatewayGroup,
    eventGroup,
    detailGroup
  ];
}

export default function apexPropertiesProvider(
    eventBus, bpmnFactory, canvas,
    elementRegistry, translate) {

  PropertiesActivator.call(this, eventBus);

  eventBus.on('saveXML.start', function() {
    removeInvalidExtensionsElements(bpmnFactory, canvas, elementRegistry)
  });

  this.getTabs = function (element) {

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
    };

    // The 'APEX' tab
    var ApexTab = {
      id: 'apex',
      label: 'APEX',
      groups: createApexTabGroups(element, translate)
    };

    var VariablesTab = {
      id: 'variables',
      label: 'Variables',
      groups: createVariablesTabGroup(element, bpmnFactory, elementRegistry, translate)
    };

    // Show general + APEX tabs
    return [
      generalTab,
      ApexTab,
      VariablesTab,
    ];
  };
}

inherits(apexPropertiesProvider, PropertiesActivator);

apexPropertiesProvider.$inject = ['eventBus', 'bpmnFactory', 'canvas', 'elementRegistry', 'translate'];
