import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from './helper/util';
import ExecutePlsqlProps from './parts/executePlsql/ExecutePlsqlProps';
import ProcVarGroup from './parts/processVariables/ProcVarGroup';
import ApexPageProps from './parts/userTask/ApexPageProps';
import ApexApprovalProps from './parts/userTask/ApprovalTaskProps';
import ApexSimpleFormProps from './parts/userTask/SimpleFormProps';

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

import CustomExtensionProps from './parts/CustomExtensionProps';
import EventTypeProps from './parts/events/EventTypeProps';
import SimpleMessageProps from './parts/message/SimpleMessageProps';

import MultiInstanceLoopProps from './parts/multiInstanceLoop/MultiInstanceLoopProps';

import { removeInvalidExtensionsElements } from './helper/validateXML';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

import { query as domQuery } from 'min-dom';

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

      const businessObject = getBusinessObject(element);
      
      let multiInstanceLoopHeading;
      
      if (businessObject.loopCharacteristics) {
        if (is(businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) multiInstanceLoopHeading = translate('Multi-Instance');
        if (is(businessObject.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) multiInstanceLoopHeading = translate('Loop');
      }

      // task
      if (
        is(element, 'bpmn:Task') && 
        !ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'])
      ) {
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // userTask
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'apexPage', translate('APEX Page'), ApexPageProps));
        newGroups.push(createSection({element, injector, translate}, 'apexApproval', translate('APEX Approval'), ApexApprovalProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleForm', translate('APEX Simple Form'), ApexSimpleFormProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, translate}, 'assignment', translate('Assignment'), AssignmentProps));
        newGroups.push(createSection({element, translate}, 'scheduling', translate('Scheduling'), SchedulingProps));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // scriptTask
      if (is(element, 'bpmn:ScriptTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // serviceTask
      if (is(element, 'bpmn:ServiceTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'sendMail', translate('Mail'), SendMailProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // businessRuleTask
      if (is(element, 'bpmn:BusinessRuleTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // sendTask
      if (is(element, 'bpmn:SendTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleMessage', translate('Simple Message'), SimpleMessageProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // receiveTask
      if (is(element, 'bpmn:ReceiveTask')) {
        newGroups.push(createSection({element, injector, translate}, 'taskType', translate('Task Type'), TaskTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'executePlsql', translate('PL/SQL'), ExecutePlsqlProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleMessage', translate('Simple Message'), SimpleMessageProps));
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // manualTask
      if (is(element, 'bpmn:ManualTask')) {
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
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
        // newGroups.push(createSection({element, injector, translate}, 'backgroundTaskSession', translate('Background Task Session'), BackgroundTaskSessionProps));
        newGroups.push(createSection({element, translate}, 'scheduling', translate('Scheduling'), SchedulingProps));
      }

      // subprocess
      if (is(element, 'bpmn:SubProcess')) {
        newGroups.push(createSection({element, injector, translate}, 'loop', multiInstanceLoopHeading, MultiInstanceLoopProps));
      }

      // add the message event props
      if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:BoundaryEvent')) {
        newGroups.push(createSection({element, injector, translate}, 'eventType', translate('Event Type'), EventTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleMessage', translate('Simple Message'), SimpleMessageProps));
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
      
      // add start event sections
      if (is(element, 'bpmn:StartEvent')) {
        newGroups.push(createSection({element, injector, translate}, 'eventType', translate('Event Type'), EventTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleMessage', translate('Simple Message'), SimpleMessageProps));
      }
      
      // add terminate event section
      if (is(element, 'bpmn:EndEvent')) {
        newGroups.push(createSection({element, injector, translate}, 'eventType', translate('Event Type'), EventTypeProps));
        newGroups.push(createSection({element, injector, translate}, 'simpleMessage', translate('Simple Message'), SimpleMessageProps));
        newGroups.push(createSection({element, translate}, 'customTerminate', translate('Details'), TerminateEventProps));
      }

      // add event proc var section
      if (is(element, 'bpmn:Event')) {
        newGroups.push(createSection({element, injector, translate}, 'procVars', translate('Variable Expressions'), ProcVarGroup));
      }

      // add custom section
      if (showCustomExtensions) {
        newGroups.push(createSection({element, injector, translate}, 'custom', translate('Custom'), CustomExtensionProps));
      }
      
      // filter: add all non-empty groups
      newGroups.forEach((g) => {
        if (typeof g.entries !== 'undefined' && g.entries.length > 0) groups.push(g);
      });

      const removeGroups = ['timer', 'message', 'multiInstance'];
      
      groups = groups.filter(g => !removeGroups.includes(g.id));

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
