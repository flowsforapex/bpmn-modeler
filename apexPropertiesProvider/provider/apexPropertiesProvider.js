import inherits from 'inherits';
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';

// Require your custom property entries.
import apexUsertaskProps from './parts/userTaskProps.js';
import apexScriptTaskProps from './parts/scriptTaskProps.js';
import apexServiceTaskProps from './parts/serviceTaskProps.js';

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {

  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);

  var detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return[
    generalGroup,
    detailsGroup,
    documentationGroup
  ];
}

// Create custom APEX TabGroup
function createApexTabGroups(element, translate) {
  // Create a group called for APEX-Page Call
  var apexPageGroup = {
    id: 'apex-page-call',
    label: 'Call APEX Page',
    entries: []
  };
  apexUsertaskProps(apexPageGroup, element, translate);

  var apexScriptGroup = {
    id: 'apex-script-group',
    label: 'PL/SQL Script',
    entries: []
  };
  apexScriptTaskProps(apexScriptGroup, element, translate);
  apexServiceTaskProps(apexScriptGroup, element, translate);

  return [
    apexPageGroup,
    apexScriptGroup
  ];
}

export default function apexPropertiesProvider(
    eventBus, bpmnFactory, canvas,
    elementRegistry, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

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

    // Show general + APEX tabs
    return [
      generalTab,
      ApexTab
    ];
  };
}

inherits(apexPropertiesProvider, PropertiesActivator);

apexPropertiesProvider.$inject = [ 'eventBus', 'bpmnFactory', 'canvas', 'elementRegistry', 'translate' ];
