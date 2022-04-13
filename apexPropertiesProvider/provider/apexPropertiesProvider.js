// eslint-disable-next-line import/no-extraneous-dependencies
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import inherits from 'inherits';
import { removeInvalidExtensionsElements } from './helper/validateXML';
import executePlsqlBusinessRule from './parts/businessRuleTask/executePlsql.js';
import subProcessProps from './parts/callActivity/callActivity';
import eventProps from './parts/events/EventProps';
// Require your custom property entries.
import globalProps from './parts/globalProps.js';
import generateCallActivityProcessVariables from './parts/process_variables/callActivityProcVarProps.js';
import generateEventProcessVariables from './parts/process_variables/eventProcVarProps.js';
import generateGatewayProcessVariables from './parts/process_variables/gatewayProcVarProps.js';
import {
  procVarDetailProps,
  procVarExpressionProps
} from './parts/process_variables/procVarDetailProps.js';
import { isSelected } from './parts/process_variables/procVarLists.js';
import generateTaskProcessVariables from './parts/process_variables/taskProcVarProps.js';
import executePlsqlScript from './parts/scriptTask/executePlsql.js';
import executePlsqlService from './parts/serviceTask/executePlsql.js';
import {
  baseAttributes,
  contentAttributes
} from './parts/serviceTask/sendMail';
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
  var subProcessGroup = {
    id: 'subProcess',
    label: translate('Called SubProcess Diagram'),
    entries: [],
  };

  globalProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  typeProps(typeGroup, elementRegistry, bpmnFactory, element, translate);
  subProcessProps(
    subProcessGroup,
    element,
    bpmnFactory,
    elementRegistry,
    translate
  );

  return [
    generalGroup,
    typeGroup,
    subProcessGroup,
    detailsGroup,
    documentationGroup,
  ];
}

function createApexTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  return [
    {
      id: 'apex-call-page',
      label: translate('Call APEX Page'),
      entries: apexPageProps(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate
      ),
    },
  ];
}

function createPLSQLTabGroups(element, bpmnFactory, commandStack, translate) {
  var scriptGroup = {
    id: 'apex-execute-plsql-script',
    label: translate('Execute PL/SQL'),
    entries: executePlsqlScript(element, bpmnFactory, commandStack, translate),
  };
  var serviceGroup = {
    id: 'apex-execute-plsql-service',
    label: translate('Execute PL/SQL'),
    entries: executePlsqlService(element, bpmnFactory, commandStack, translate),
  };
  var businessRuleGroup = {
    id: 'apex-execute-plsql-business-rule',
    label: translate('Execute PL/SQL'),
    entries: executePlsqlBusinessRule(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };
  return [scriptGroup, serviceGroup, businessRuleGroup];
}

function createExternalURLTabGroups(element, bpmnFactory, translate) {
  return [
    {
      id: 'apex-external-url',
      label: translate('Call External URL'),
      entries: externalUrlProps(element, bpmnFactory, translate),
    },
  ];
}

function createMailTabGroups(element, bpmnFactory, commandStack, translate) {
  var apexServiceGroup1 = {
    id: 'apex-mail-base',
    label: translate('General'),
    entries: baseAttributes(element, bpmnFactory, translate),
  };
  var apexServiceGroup2 = {
    id: 'apex-mail-content',
    label: translate('Content'),
    entries: contentAttributes(element, bpmnFactory, commandStack, translate),
  };

  return [apexServiceGroup1, apexServiceGroup2];
}

function createVariablesTabGroups(
  element,
  bpmnFactory,
  commandStack,
  translate
) {
  var taskGroup = {
    id: 'apex-task',
    label: translate('Process Variables'),
    entries: generateTaskProcessVariables(element, bpmnFactory, translate),
  };

  var gatewayGroup = {
    id: 'apex-gateway',
    label: translate('Process Variables'),
    entries: generateGatewayProcessVariables(element, bpmnFactory, translate),
  };

  var eventGroup = {
    id: 'apex-event',
    label: translate('Process Variables'),
    entries: generateEventProcessVariables(element, bpmnFactory, translate),
  };

  var detailGroup = {
    id: 'details',
    label: translate('Variable Details'),
    entries: procVarDetailProps(element, translate),
    enabled: isSelected,
  };

  var expressionGroup = {
    id: 'expression',
    label: translate('Variable Expression'),
    entries: procVarExpressionProps(element, commandStack, translate),
    enabled: isSelected,
  };

  return [
    taskGroup,
    gatewayGroup,
    eventGroup,
    detailGroup,
    expressionGroup,
  ];
}

function createMappingTabGroups(
  element,
  bpmnFactory,
  commandStack,
  translate
) {

  var callActivityGroup = {
    id: 'apex-callActivity',
    label: translate('Process Variables'),
    entries: generateCallActivityProcessVariables(
      element,
      bpmnFactory,
      translate
    ),
  };

  var detailGroup = {
    id: 'details',
    label: translate('Variable Details'),
    entries: procVarDetailProps(element, translate),
    enabled: isSelected,
  };

  var expressionGroup = {
    id: 'expression',
    label: translate('Variable Expression'),
    entries: procVarExpressionProps(element, commandStack, translate),
    enabled: isSelected,
  };

  return [
    callActivityGroup,
    detailGroup,
    expressionGroup,
  ];
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
    removeInvalidExtensionsElements(bpmnFactory, elementRegistry);
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

    var ApexTab = {
      id: 'apex',
      label: translate('APEX'),
      groups: createApexTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        commandStack,
        translate
      ),
    };

    var PlsqlTab = {
      id: 'plsql',
      label: translate('PL/SQL'),
      groups: createPLSQLTabGroups(
        element,
        bpmnFactory,
        commandStack,
        translate
      ),
    };

    var ExternalUrlTab = {
      id: 'url',
      label: translate('URL'),
      groups: createExternalURLTabGroups(element, bpmnFactory, translate),
    };

    var MailTabGroups = {
      id: 'mail',
      label: translate('Mail'),
      groups: createMailTabGroups(
        element,
        bpmnFactory,
        commandStack,
        translate
      ),
    };

    var VariablesTab = {
      id: 'variables',
      label: translate('Variables'),
      groups: createVariablesTabGroups(
        element,
        bpmnFactory,
        commandStack,
        translate
      ),
    };

    var MappingTab = {
      id: 'mapping',
      label: translate('Input/Output Mapping'),
      groups: createMappingTabGroups(
        element,
        bpmnFactory,
        commandStack,
        translate
      ),
    };

    return [
      generalTab,
      ApexTab,
      PlsqlTab,
      ExternalUrlTab,
      MailTabGroups,
      VariablesTab,
      MappingTab,
    ];
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
