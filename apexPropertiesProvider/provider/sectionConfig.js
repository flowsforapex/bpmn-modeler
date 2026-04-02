import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from './helper/util';

// callActivity
import CallActivityProps from './parts/callActivity/CallActivityProps';

// events
import EventTypeProps from './parts/events/EventTypeProps';
import TerminateEventProps from './parts/events/TerminateEventProps';

// executePlsql
import ExecutePlsqlProps from './parts/executePlsql/ExecutePlsqlProps';

// inOutParameters
import InOutParamGroup from './parts/inOutParameters/InOutParamGroup';

// lane
import RoleProps from './parts/lane/RoleProps';

// message
import SimpleMessageProps from './parts/message/SimpleMessageProps';

// multiInstanceLoop
import MultiInstanceLoopProps from './parts/multiInstanceLoop/MultiInstanceLoopProps';

// process
import BackgroundTaskSessionProps from './parts/process/BackgroundTaskSessionProps';
import ExecutionProps from './parts/process/ExecutionProps';
import ProcessProps from './parts/process/ProcessProps';
import StarterProps from './parts/process/StarterProps';

// processVariables
import ProcVarGroup from './parts/processVariables/ProcVarGroup';

// scheduling
import SchedulingProps from './parts/scheduling/SchedulingProps';

// sequenceFlow
import SequenceFlowProps from './parts/sequenceFlow/SequenceFlowProps';

// serviceTask
import ApexAIGenerationProps from './parts/serviceTask/ApexAIGenerationProps';
import SendMailProps from './parts/serviceTask/SendMailProps';

// subprocess
import { AdHocSubProcessProps, AIProps, CompletionProps, DetailPageProps, StartingProps, VisibilityProps } from './parts/subprocess/AdHocSubprocessProps';

// task
import TaskAdHocProps from './parts/task/TaskAdHocProps';
import TaskProps from './parts/task/TaskProps';
import TaskTypeProps from './parts/task/TaskTypeProps';

// timer
import CustomTimerProps from './parts/timer/CustomTimerProps';

// userTask
import ApexPageProps from './parts/userTask/ApexPageProps';
import ApprovalProps from './parts/userTask/ApprovalTaskProps';
import AssignmentProps from './parts/userTask/AssignmentProps';
import SimpleFormProps from './parts/userTask/SimpleFormProps';

// custom
import CustomExtensionProps from './parts/CustomExtensionProps';
import AsyncProps from './parts/scriptTask/AsyncProps';

// helper for dynamic loop heading
function multiInstanceHeading(element) {
  const bo = getBusinessObject(element);
  if (!bo.loopCharacteristics) { return null; }
  if (is(bo.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) return 'Multi-Instance';
  if (is(bo.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) return 'Loop';
  return null;
}

const taskSectionsExclude = [
  'bpmn:UserTask',
  'bpmn:ScriptTask',
  'bpmn:ServiceTask',
  'bpmn:BusinessRuleTask',
  'bpmn:SendTask',
  'bpmn:ReceiveTask',
  'bpmn:ManualTask'
]

export const taskSections = [
  { id: 'adHoc', label: 'Ad Hoc', props: TaskAdHocProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup, exclude: taskSectionsExclude },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup, exclude: taskSectionsExclude },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps, exclude: taskSectionsExclude },
  { id: 'general', props: TaskProps}
];

export const userTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'apexPage', label: 'APEX Page', props: ApexPageProps },
  { id: 'apexApproval', label: 'APEX Human Task', props: ApprovalProps },
  { id: 'simpleForm', label: 'APEX Simple Form', props: SimpleFormProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'assignment', label: 'Assignment', props: AssignmentProps },
  { id: 'scheduling', label: 'Scheduling', props: SchedulingProps },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const scriptTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'executePlsql', label: 'PL/SQL', props: ExecutePlsqlProps },
  { id: 'async', label: 'Async', props: AsyncProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const serviceTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'executePlsql', label: 'PL/SQL', props: ExecutePlsqlProps },
  { id: 'sendMail', label: 'Mail', props: SendMailProps },
  { id: 'apexAIGeneration', label: 'APEX AI Generation', props: ApexAIGenerationProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const businessRuleTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'executePlsql', label: 'PL/SQL', props: ExecutePlsqlProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const sendTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'executePlsql', label: 'PL/SQL', props: ExecutePlsqlProps },
  { id: 'simpleMessage', label: 'Simple Message', props: SimpleMessageProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const receiveTaskSections = [
  { id: 'taskType', label: 'Task Type', props: TaskTypeProps },
  { id: 'executePlsql', label: 'PL/SQL', props: ExecutePlsqlProps },
  { id: 'simpleMessage', label: 'Simple Message', props: SimpleMessageProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup },
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const manualTaskSections = [
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps }
];

export const callActivitySections = [
  { id: 'callActivity', label: 'Called Diagram', props: CallActivityProps },
  { id: 'procVars', label: 'In/Out Mapping', props: ProcVarGroup }
];

export const processSections = [
  { id: 'execution', label: 'Execution', props: ExecutionProps },
  { id: 'procVars', label: 'In/Out Variables', props: ProcVarGroup },
  { id: 'starter', label: 'Potential Starters', props: StarterProps },
  { id: 'backgroundTaskSession', label: 'Background Task Session', props: BackgroundTaskSessionProps },
  { id: 'scheduling', label: 'Scheduling', props: SchedulingProps },
  { id: 'general', props: ProcessProps}
];

export const subProcessSections = [
  { id: 'loop', label: multiInstanceHeading, props: MultiInstanceLoopProps },
  { id: 'ai', label: 'AI', props: AIProps },
  { id: 'starting', label: 'Starting Activities', props: StartingProps },
  { id: 'completion', label: 'Completion Condition', props: CompletionProps },
  { id: 'visibility', label: 'Visibility', props: VisibilityProps },
  { id: 'detailPage', label: 'Detail Page', props: DetailPageProps },
  { id: 'assignment', label: 'Assignment', props: AssignmentProps },
  { id: 'scheduling', label: 'Scheduling', props: SchedulingProps },
  { id: 'general', props: AdHocSubProcessProps}
];

export const eventSections = [
  { id: 'eventType', label: 'Event Type', props: EventTypeProps },
  { id: 'customTimer', label: 'Timer', props: CustomTimerProps },
  { id: 'simpleMessage', label: 'Simple Message', props: SimpleMessageProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup }
];

export const laneSections = [
  { id: 'role', label: 'APEX Role', props: RoleProps }
];

export const gatewaySections = [
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup }
];

export const sequenceFlowSections = [
  { id: 'condition', label: 'Condition', props: SequenceFlowProps }
];

export const startEventSections = [
  { id: 'eventType', label: 'Event Type', props: EventTypeProps },
  { id: 'customTimer', label: 'Timer', props: CustomTimerProps },
  { id: 'simpleMessage', label: 'Simple Message', props: SimpleMessageProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup },
  { id: 'parameters', label: 'Parameters', props: InOutParamGroup }
];

export const endEventSections = [
  { id: 'eventType', label: 'Event Type', props: EventTypeProps },
  { id: 'customTimer', label: 'Timer', props: CustomTimerProps },
  { id: 'simpleMessage', label: 'Simple Message', props: SimpleMessageProps },
  { id: 'customTerminate', label: 'Details', props: TerminateEventProps },
  { id: 'procVars', label: 'Variable Expressions', props: ProcVarGroup }
];

export const customExtensionSections = [
  { id: 'custom', label: 'Custom', props: CustomExtensionProps }
];
