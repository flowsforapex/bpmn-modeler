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
//import urlProps from './parts/urlProps.js';
import emailProps from './parts/emailProps.js';
import scriptProps from './parts/scriptProps.js';


// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {

  var generalGroup = {
    id: "general",
    label: "General",
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);

  var detailsGroup = {
    id: "details",
    label: "Details",
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  var documentationGroup = {
    id: "documentation",
    label: "Documentation",
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
function createApexTabGroups(element) {


  // Create a group called for APEX-Page Call
  var apexPageGroup = {
    id: "apex-page-call",
    label: "Call APEX Page",
    entries: []
  };
  apexUsertaskProps(apexPageGroup, element);

  var apexMailGroup = {
    id: "apex-mail-group",
    label: "APEX Mail",
    entries: []
  };
  emailProps(apexMailGroup, element);

  var apexScriptGroup = {
    id: "apex-script-group",
    label: "PL/SQL Script",
    entries: []
  };
  scriptProps(apexScriptGroup, element);

  return [
    apexPageGroup,
    apexMailGroup,
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

    // The "APEX" tab
    var ApexTab = {
      id: 'apex',
      label: 'APEX',
      groups: createApexTabGroups(element)
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
