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
import businessRuleTaskExecutePlsql from './parts/businessRuleTask/executePlsql.js';
import eventProps from './parts/events/EventProps';
// Require your custom property entries.
import globalProps from './parts/globalProps.js';
import generateEventTaskProcessVariables from './parts/process_variables/eventProcVarProps.js';
import generateGatewayTaskProcessVariableLists from './parts/process_variables/gatewayProcVarProps.js';
import {
  procVarDetailProps,
  procVarExpressionProps
} from './parts/process_variables/procVarDetailProps.js';
import { isSelected } from './parts/process_variables/procVarLists.js';
import generateUserTaskProcessVariableLists from './parts/process_variables/taskProcVarProps.js';
import scriptTaskExecutePlsql from './parts/scriptTask/executePlsql.js';
import serviceTaskExecutePlsql from './parts/serviceTask/executePlsql';
import {
  baseAttributes,
  contentAttributes,
  miscAttributes
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

  globalProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  typeProps(typeGroup, elementRegistry, bpmnFactory, element, translate);

  return [generalGroup, typeGroup, detailsGroup, documentationGroup];
}

function createApexTabGroups(element, bpmnFactory, elementRegistry, translate) {
  return [
    {
      id: 'apex-call-page',
      label: translate('Call APEX Page'),
      entries: apexPageProps(element, bpmnFactory, elementRegistry, translate),
    },
  ];
}

function createPLSQLTabGroups(element, bpmnFactory, commandStack, translate) {
  var apexScriptGroup = {
    id: 'apex-script-plsql',
    label: translate('Execute PL/SQL'),
    entries: scriptTaskExecutePlsql(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };
  var apexServiceGroup = {
    id: 'apex-service-plsql',
    label: translate('Execute PL/SQL'),
    entries: serviceTaskExecutePlsql(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };
  var apexBusinessRuleGroup = {
    id: 'apex-businessRule-plsql',
    label: translate('Execute PL/SQL'),
    entries: businessRuleTaskExecutePlsql(
      element,
      bpmnFactory,
      commandStack,
      translate
    ),
  };

  return [apexScriptGroup, apexServiceGroup, apexBusinessRuleGroup];
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
    label: translate('Address settings'),
    entries: baseAttributes(element, bpmnFactory, translate),
  };
  var apexServiceGroup2 = {
    id: 'apex-mail-content',
    label: translate('Email content'),
    entries: contentAttributes(element, bpmnFactory, commandStack, translate),
  };
  var apexServiceGroup3 = {
    id: 'apex-mail-misc',
    label: translate('Misc'),
    entries: miscAttributes(element, bpmnFactory, commandStack, translate),
  };

  return [apexServiceGroup1, apexServiceGroup2, apexServiceGroup3];
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
    entries: generateUserTaskProcessVariableLists(
      element,
      bpmnFactory,
      translate
    ),
  };

  var gatewayGroup = {
    id: 'apex-gateway',
    label: translate('Process Variables'),
    entries: generateGatewayTaskProcessVariableLists(
      element,
      bpmnFactory,
      translate
    ),
  };

  var eventGroup = {
    id: 'apex-event',
    label: translate('Process Variables'),
    entries: generateEventTaskProcessVariables(element, bpmnFactory, translate),
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

    return [
      generalTab,
      ApexTab,
      PlsqlTab,
      ExternalUrlTab,
      MailTabGroups,
      VariablesTab,
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
