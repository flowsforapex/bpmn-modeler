// eslint-disable-next-line import/no-extraneous-dependencies
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import inherits from 'inherits';
import eventProps from './parts/events/EventProps';
// Require your custom property entries.
import globalProps from './parts/globalProps.js';
import generateEventTaskProcessVariables from './parts/process_variables/eventProcVarProps.js';
import generateGatewayTaskProcessVariableLists from './parts/process_variables/gatewayProcVarProps.js';
import { removeInvalidExtensionsElements } from './parts/process_variables/helper/validateXML';
import {
  procVarDetailProps,
  procVarExpressionProps
} from './parts/process_variables/procVarDetailProps.js';
import { isSelected } from './parts/process_variables/procVarLists.js';
import generateUserTaskProcessVariableLists from './parts/process_variables/taskProcVarProps.js';
import generateScriptTaskEntries from './parts/scriptTaskProps.js';
import generateServiceTaskEntries from './parts/serviceTaskProps.js';
import typeProps from './parts/typeProps';
import apexPageProps from './parts/userTask/apexPageProps';
import externalUrlProps from './parts/userTask/externalUrlProps';

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(
  element,
  bpmnFactory,
  canvas,
  elementRegistry,
  translate
) {
  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: [],
  };
  var typeGroup = {
    id: 'type',
    label: translate('Type'),
    entries: [],
  };
  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: [],
  };
  var documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: [],
  };

  globalProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  typeProps(typeGroup, element, translate);

  return [generalGroup, typeGroup, detailsGroup, documentationGroup];
}

function createApexTabGroups(
  element,
  bpmnFactory,
  commandStack,
  elementRegistry,
  translate
) {
  var apexPageGroup = {
    id: 'apex-page-calls',
    label: translate('Call APEX Page'),
    entries: apexPageProps(element, bpmnFactory, elementRegistry, translate),
  };
  var apexScriptGroup = {
    id: 'apex-script-group',
    label: translate('Script Task'),
    entries: generateScriptTaskEntries(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };
  var apexServiceGroup = {
    id: 'apex-service-group',
    label: translate('Service Task'),
    entries: generateServiceTaskEntries(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };

  return [apexPageGroup, apexScriptGroup, apexServiceGroup];
}

function createExternalURLTab(element, bpmnFactory, translate) {
  return [
    {
      id: 'apex-external-url',
      label: translate('Call External URL'),
      entries: externalUrlProps(element, bpmnFactory, translate),
    },
  ];
}

function createVariablesTabGroup(
  element,
  bpmnFactory,
  elementRegistry,
  translate
) {
  var taskGroup = {
    id: 'apex-task',
    label: translate('Process Variables'),
    entries: generateUserTaskProcessVariableLists(
      element,
      bpmnFactory,
      elementRegistry,
      translate
    ),
  };

  var gatewayGroup = {
    id: 'apex-gateway',
    label: translate('Process Variables'),
    entries: generateGatewayTaskProcessVariableLists(
      element,
      bpmnFactory,
      elementRegistry,
      translate
    ),
  };

  var eventGroup = {
    id: 'apex-event',
    label: translate('Process Variables'),
    entries: generateEventTaskProcessVariables(
      element,
      bpmnFactory,
      elementRegistry,
      translate
    ),
  };

  var detailGroup = {
    id: 'details',
    label: translate('Variable Details'),
    entries: procVarDetailProps(element, bpmnFactory, translate),
    enabled: isSelected,
  };

  var expressionGroup = {
    id: 'expression',
    label: translate('Variable Expression'),
    entries: procVarExpressionProps(element, bpmnFactory, translate),
    enabled: isSelected,
  };

  return [taskGroup, gatewayGroup, eventGroup, detailGroup, expressionGroup];
}

export default function apexPropertiesProvider(
  eventBus,
  bpmnFactory,
  canvas,
  elementRegistry,
  translate,
  commandStack
) {
  PropertiesActivator.call(this, eventBus);

  eventBus.on('saveXML.start', function () {
    removeInvalidExtensionsElements(bpmnFactory, canvas, elementRegistry);
  });

  this.getTabs = function (element) {
    var generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element,
        bpmnFactory,
        canvas,
        elementRegistry,
        translate
      ),
    };

    // The 'APEX' tab
    var ApexTab = {
      id: 'apex',
      label: translate('APEX'),
      groups: createApexTabGroups(
        element,
        bpmnFactory,
        commandStack,
        elementRegistry,
        translate
      ),
    };

    var ExternalUrlTab = {
      id: 'url',
      label: translate('URL'),
      groups: createExternalURLTab(element, bpmnFactory, translate),
    };

    var VariablesTab = {
      id: 'variables',
      label: translate('Variables'),
      groups: createVariablesTabGroup(
        element,
        bpmnFactory,
        elementRegistry,
        translate
      ),
    };

    // Show general + APEX tabs
    return [generalTab, ApexTab, ExternalUrlTab, VariablesTab];
  };
}

inherits(apexPropertiesProvider, PropertiesActivator);

apexPropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'canvas',
  'elementRegistry',
  'translate',
  'commandStack',
];
