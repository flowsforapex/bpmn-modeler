import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from './helper/util';
import ExecutePlsqlProps from './parts/executePlsql/ExecutePlsqlProps';
import ProcVarGroup from './parts/processVariables/ProcVarGroup';
import ApexPageProps from './parts/userTask/ApexPageProps';
import ApexApprovalProps from './parts/userTask/ApprovalTaskProps';

import TaskTypeProps from './parts/task/TaskTypeProps';
import CustomTimerProps from './parts/timer/CustomTimerProps';

import AssignmentProps from './parts/userTask/AssignmentProps';

import ExecutionProps from './parts/process/ExecutionProps';

import RoleProps from './parts/lane/RoleProps';
import SchedulingProps from './parts/scheduling/SchedulingProps';

import CallActivityProps from './parts/callActivity/CallActivityProps';
import StarterProps from './parts/process/StarterProps';

import TerminateEventProps from './parts/events/TerminateEventProps';
import BackgroundTaskSessionProps from './parts/process/BackgroundTaskSessionProps';
import SequenceFlowProps, { setDefaultSequence } from './parts/sequenceFlow/SequenceFlowProps';
import SendMailProps from './parts/serviceTask/SendMailProps';

import { removeInvalidExtensionsElements } from './helper/validateXML';
import CustomExtensionProps from './parts/CustomExtensionProps';
import EventTypeProps from './parts/events/EventTypeProps';
import BasicApexMessageProps from './parts/message/BasicApexMessageProps';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

var domQuery = require('min-dom').query;

const LOW_PRIORITY = 500;

function createSection(args, id, label, props) {

  const section = {
    id: id,
    label: label,
    entries: props(args)
  };

  return section;
}

function makePropertiesPanelResizable() {
  const canvas = domQuery('.canvas');
  const parentNode = domQuery('.properties-panel-parent');

  var mouseX;
  const BORDER_WIDTH = 5;

  document.addEventListener('mousedown', function (event) {
    if (event.offsetX < BORDER_WIDTH) {
      mouseX = event.x;
      document.addEventListener('mousemove', resize, false);
    }
  });

  document.addEventListener('mouseup', function () {
    document.removeEventListener('mousemove', resize, false);
  });

  function resize(event) {
    var dx = mouseX - event.x;
    var panelWidth = parentNode.scrollWidth + dx;
    var maxWidth =
      (parseInt(getComputedStyle(canvas, '').width, 10) / 100) *
      parseInt(getComputedStyle(parentNode).maxWidth, 10);
    
    mouseX = event.x;
    
    if (
      panelWidth >= parseInt(getComputedStyle(parentNode).minWidth, 10) &&
      panelWidth < maxWidth
    ) {
      parentNode.style.width = `${panelWidth}px`;
      parentNode.firstChild.style.width = `${panelWidth}px`;
    }
  }
}

export default function apexPropertiesProvider(
  propertiesPanel,
  injector,
  eventBus,
  modeling,
  elementRegistry,
  translate,
  showCustomExtensions
) {
  makePropertiesPanelResizable();

  eventBus.on('saveXML.start', function () {
    removeInvalidExtensionsElements(elementRegistry, modeling);
  });

  // TODO test if needed
  // eventBus.on('connection.added', function (event) {
  //   setDefaultSequence(event.element, modeling);
  // });

  eventBus.on('commandStack.connection.create.postExecute', function (event) {
    setDefaultSequence(event.context.connection, modeling);
  });

  this.getGroups = function (element) {
    return function (groups) {
      const newGroups = [];

      // task
      if (
        is(element, 'bpmn:Task') && 
        !ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'])
      ) {
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // userTask
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'apexPage', translate('APEX Page'), ApexPageProps));
        newGroups.push(createSection({element, injector, translate}, 'apexApproval', translate('APEX Approval'), ApexApprovalProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, translate}, 'assignment', translate('Assignment'), AssignmentProps));
        newGroups.push(createSection({element, translate}, 'scheduling', translate('Scheduling'), SchedulingProps));
      }

      // scriptTask
      if (is(element, 'bpmn:ScriptTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // serviceTask
      if (is(element, 'bpmn:ServiceTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'sendMail', translate('Mail'), SendMailProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // businessRuleTask
      if (is(element, 'bpmn:BusinessRuleTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // sendTask
      if (is(element, 'bpmn:SendTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'basicApexMessage', translate('Basic APEX Message'), BasicApexMessageProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // receiveTask
      if (is(element, 'bpmn:ReceiveTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'basicApexMessage', translate('Basic APEX Message'), BasicApexMessageProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // callActivity
      if (is(element, 'bpmn:CallActivity')) {
        newGroups.push(createSection({element, injector, translate}, 'callActivity', translate('Called Diagram'), CallActivityProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('In/Out Mapping'), ProcVarGroup));
      }

      // process
      if (is(element, 'bpmn:Process') || is(getBusinessObject(element), 'bpmn:Process')) {
        newGroups.push(createSection({element, injector, translate}, 'execution', translate('Execution'), ExecutionProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('In/Out Variables'), ProcVarGroup));
        newGroups.push(createSection({element, translate}, 'starter', translate('Potential Starters'), StarterProps));
        newGroups.push(createSection({element, injector, translate}, 'backgroundTaskSession', translate('Background Task Session'), BackgroundTaskSessionProps));
        newGroups.push(createSection({element, translate}, 'scheduling', translate('Scheduling'), SchedulingProps));
      }

      // add the message event props
      if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
        newGroups.push(createSection({element, injector, translate}, 'eventType', translate('Event Type'), EventTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'basicApexMessage', translate('Basic APEX Message'), BasicApexMessageProps));
      }

      // lane
      if (is(element, 'bpmn:Lane')) {
        newGroups.push(createSection({element, injector, translate}, 'role', translate('APEX Role'), RoleProps));
      }

      // gateways
      if (is(element, 'bpmn:Gateway')) {
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // add the routing expression section
      if (is(element, 'bpmn:SequenceFlow')) {
        newGroups.push(createSection({element, injector, translate}, 'condition', translate('Condition'), SequenceFlowProps));
      }

      // add the custom timer section
      newGroups.push(createSection({element, translate}, 'customTimer', translate('Timer'), CustomTimerProps));

      // add event proc var section
      if (is(element, 'bpmn:Event')) {
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // add terminate event section
      if (is(element, 'bpmn:EndEvent')) {
        newGroups.push(createSection({element, translate}, 'customTerminate', translate('Details'), TerminateEventProps));
      }

      // add custom section
      if (showCustomExtensions) {
        newGroups.push(createSection({element, injector, translate}, 'custom', translate('Custom'), CustomExtensionProps));
      }
      
      // filter: add all non-empty groups
      newGroups.forEach((g) => {
        if (typeof g.entries !== 'undefined' && g.entries.length > 0) groups.push(g);
      });
      
      groups = groups.filter(g => g.id !== 'timer' && g.id !== 'message');

      return groups;
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
