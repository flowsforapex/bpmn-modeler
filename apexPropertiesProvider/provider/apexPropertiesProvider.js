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
import userProps from './parts/userProps.js';
import emailProps from './parts/emailProps.js';
import scriptProps from './parts/scriptProps.js';


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

// Create the custom User tab
function createUserTabGroups(element) {

  // Create a group called "User Task".
  var UserGroup = {
    id: 'User-Group',
    label: "User Properties",
    entries: []
  };

  // Add the spell props to the User group.
  userProps(UserGroup, element);
  return [
    UserGroup
  ];
}

function createServiceTabGroups(element) {

    // Create a group called "Service".
    var ServiceGroup = {
      id: 'Service-Group',
      label: "Email Service",
      entries: []
    };
  
    // Add the spell props to the APEX group.
    emailProps(ServiceGroup, element);
    return [
      ServiceGroup
    ];
  }

  function createScriptTabGroups(element) {

    // Create a group called "Script".
    var ScriptGroup = {
      id: 'Script-Group',
      label: "",
      entries: []
    };
  
    // Add the spell props to the Script group.
    scriptProps(ScriptGroup, element);
    return [
      ScriptGroup
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
    var UserTab = {
      id: 'User-Tab',
      label: 'User Task',
      groups: createUserTabGroups(element)
    };

    var ServiceTab = {
        id: 'Service-Tab',
        label: 'Service Task',
        groups: createServiceTabGroups(element)
    };

    var ScriptTab = {
        id: 'Script-Tab',
        label: 'Script Task',
        groups: createScriptTabGroups(element)
    };

    // Show general + "APEX" tab
    return [
      generalTab,
      UserTab,
      ServiceTab,
      ScriptTab
    ];
  };
}

inherits(apexPropertiesProvider, PropertiesActivator);
