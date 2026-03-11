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
import ProcessProps from './parts/process/ProcessProps';

import RoleProps from './parts/lane/RoleProps';
import SchedulingProps from './parts/scheduling/SchedulingProps';

import CallActivityProps from './parts/callActivity/CallActivityProps';
import StarterProps from './parts/process/StarterProps';

import TerminateEventProps from './parts/events/TerminateEventProps';
import BackgroundTaskSessionProps from './parts/process/BackgroundTaskSessionProps';
import SequenceFlowProps, { setDefaultSequence } from './parts/sequenceFlow/SequenceFlowProps';

import ApexAIGenerationProps from './parts/serviceTask/ApexAIGenerationProps';
import SendMailProps from './parts/serviceTask/SendMailProps';

import CustomExtensionProps from './parts/CustomExtensionProps';
import EventTypeProps from './parts/events/EventTypeProps';
import SimpleMessageProps from './parts/message/SimpleMessageProps';

import MultiInstanceLoopProps from './parts/multiInstanceLoop/MultiInstanceLoopProps';

import InOutParamGroup from './parts/inOutParameters/InOutParamGroup';
import { AdHocSubProcessProps, CompletionProps, DetailPageProps, StartingProps, VisibilityProps } from './parts/subprocess/AdHocSubprocessProps';
import TaskProps from './parts/task/TaskProps';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

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

  this.getGroups = function (element) {
    return function (groups) {
      const newGroups = [];

      const addSection = (id, labelKey, props) => {
        const section = {
          id: id,
          label: labelKey ? translate(labelKey) : null,
          entries: props({ element, injector, translate })
        };

        newGroups.push(section);
      };

      const businessObject = getBusinessObject(element);
      
      let multiInstanceLoopHeading;
      
      if (businessObject.loopCharacteristics) {
        if (is(businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) multiInstanceLoopHeading = 'Multi-Instance';
        if (is(businessObject.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) multiInstanceLoopHeading = 'Loop';
      }

      // task
      if (
        is(element, 'bpmn:Task') &&
        !ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:ReceiveTask', 'bpmn:ManualTask'])
      ) {
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
        
        addSection('parameters', 'Parameters', InOutParamGroup);

        const generalGroup = groups.find(g => g.id === 'general');
        generalGroup.entries = generalGroup.entries.concat(TaskProps({element, injector, translate}));
      }

      //TODO add subject to usertask & adhocsp

      // userTask
      if (is(element, 'bpmn:UserTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('apexPage', 'APEX Page', ApexPageProps);
        addSection('apexApproval', 'APEX Human Task', ApexApprovalProps);
        addSection('simpleForm', 'APEX Simple Form', ApexSimpleFormProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('assignment', 'Assignment', AssignmentProps);
        addSection('scheduling', 'Scheduling', SchedulingProps);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // scriptTask
      if (is(element, 'bpmn:ScriptTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('executePlsql', 'PL/SQL', ExecutePlsqlProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // serviceTask
      if (is(element, 'bpmn:ServiceTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('executePlsql', 'PL/SQL', ExecutePlsqlProps);
        addSection('sendMail', 'Mail', SendMailProps);
        addSection('apexAIGeneration', 'APEX AI Generation', ApexAIGenerationProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // businessRuleTask
      if (is(element, 'bpmn:BusinessRuleTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('executePlsql', 'PL/SQL', ExecutePlsqlProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // sendTask
      if (is(element, 'bpmn:SendTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('executePlsql', 'PL/SQL', ExecutePlsqlProps);
        addSection('simpleMessage', 'Simple Message', SimpleMessageProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // receiveTask
      if (is(element, 'bpmn:ReceiveTask')) {
        addSection('taskType', 'Task Type', TaskTypeProps);
        addSection('executePlsql', 'PL/SQL', ExecutePlsqlProps);
        addSection('simpleMessage', 'Simple Message', SimpleMessageProps);
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
        addSection('parameters', 'Parameters', InOutParamGroup);
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // manualTask
      if (is(element, 'bpmn:ManualTask')) {
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
      }

      // callActivity
      if (is(element, 'bpmn:CallActivity')) {
        addSection('callActivity', 'Called Diagram', CallActivityProps);
        addSection('procVars', 'In/Out Mapping', ProcVarGroup);
      }

      // process
      if (is(element, 'bpmn:Process') || is(getBusinessObject(element), 'bpmn:Process')) {
        addSection('execution', 'Execution', ExecutionProps);
        addSection('procVars', 'In/Out Variables', ProcVarGroup);
        addSection('starter', 'Potential Starters', StarterProps);
        addSection('backgroundTaskSession', 'Background Task Session', BackgroundTaskSessionProps);
        addSection('scheduling', 'Scheduling', SchedulingProps);

        const generalGroup = groups.find(g => g.id === 'general');
        generalGroup.entries = generalGroup.entries.concat(ProcessProps({element, injector, translate}));
      }

      // subprocess
      if (is(element, 'bpmn:SubProcess')) {
        addSection('loop', multiInstanceLoopHeading, MultiInstanceLoopProps);
        addSection('starting', 'Starting Activities', StartingProps);
        addSection('completion', 'Completion Condition', CompletionProps);
        addSection('visibility', 'Visibility', VisibilityProps);
        addSection('detailPage', 'Detail Page', DetailPageProps);
        addSection('assignment', 'Assignment', AssignmentProps);
        addSection('scheduling', 'Scheduling', SchedulingProps);

        const generalGroup = groups.find(g => g.id === 'general');
        generalGroup.entries = generalGroup.entries.concat(AdHocSubProcessProps({element, injector, translate}));
      }

      // add the message event props
      if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:BoundaryEvent')) {
        addSection('eventType', 'Event Type', EventTypeProps);
        addSection('simpleMessage', 'Simple Message', SimpleMessageProps);
      }

      // lane
      if (is(element, 'bpmn:Lane')) {
        addSection('role', 'APEX Role', RoleProps);
      }

      // gateways
      if (is(element, 'bpmn:Gateway')) {
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
      }

      // add the routing expression section
      if (is(element, 'bpmn:SequenceFlow')) {
        addSection('condition', 'Condition', SequenceFlowProps);
      }

      // add the custom timer section
      addSection('customTimer', 'Timer', CustomTimerProps);
      
      // add start event sections
      if (is(element, 'bpmn:StartEvent')) {
        addSection('eventType', 'Event Type', EventTypeProps);
        addSection('simpleMessage', 'Simple Message', SimpleMessageProps);
        addSection('parameters', 'Parameters', InOutParamGroup);
      }
      
      // add terminate event section
      if (is(element, 'bpmn:EndEvent')) {
        addSection('eventType', 'Event Type', EventTypeProps);
        addSection('simpleMessage', 'Simple Message', SimpleMessageProps);
        addSection('customTerminate', 'Details', TerminateEventProps);
      }

      // add event proc var section
      if (is(element, 'bpmn:Event')) {
        addSection('procVars', 'Variable Expressions', ProcVarGroup);
      }

      // add custom section
      if (showCustomExtensions) {
        addSection('custom', 'Custom', CustomExtensionProps);
      }
      
      // filter: add all non-empty groups
      newGroups.forEach((g) => {
        if (typeof g.entries !== 'undefined' && g.entries.length > 0) groups.push(g);
      });

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
