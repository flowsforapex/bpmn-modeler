import { is } from 'bpmn-js/lib/util/ModelUtil';
import ProcVarGroup from './parts/processVariables/ProcVarGroup';
import ExecutePlsqlProps from './parts/scriptTask/ExecutePlsqlProps';
import ApexPageProps from './parts/userTask/ApexPageProps';
import ApexApprovalProps from './parts/userTask/ApprovalTaskProps';

import CustomTimerProps from './custom/CustomTimerProps';
import TaskTypeProps from './parts/task/TaskTypeProps';

import AssignmentProps from './parts/userTask/AssignmentProps';

import ExecutionProps from './parts/process/ExecutionProps';

import RoleProps from './parts/lane/RoleProps';
import SchedulingProps from './parts/scheduling/SchedulingProps';

import CallActivityProps from './parts/callActivity/CallActivityProps';
import StarterProps from './parts/process/StarterProps';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

var domQuery = require('min-dom').query;

const LOW_PRIORITY = 500;

function createSection(args, id, label, props) {

  const section = {
    id: id,
    label: args.translate(label),
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
  translate
) {
  makePropertiesPanelResizable();

  this.getGroups = function (element) {
    return function (groups) {
      const newGroups = [];

      // add the task type section
      if (ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask'])) {
        newGroups.push(createSection({element, translate}, 'taskType', 'Task Type', TaskTypeProps));
      }

      // add the apexPage section
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createSection({element, injector, translate}, 'apexPage', 'APEX Page', ApexPageProps));
        newGroups.push(createSection({element, translate}, 'apexApproval', 'APEX Approval', ApexApprovalProps));
      }

      // add the plsql section
      if (is(element, 'bpmn:ScriptTask')) {
        newGroups.push(createSection({element, translate}, 'executePlsql', 'PL/SQL', ExecutePlsqlProps));
      }

      // add the execution section
      if (is(element, 'bpmn:Process')) {
        newGroups.push(createSection({element, translate}, 'execution', 'Execution', ExecutionProps));
      }

      // add the procVar section (filtering done inside)
      let procVarLabel;

      if (ModelingUtil.is(element, 'bpmn:CallActivity')) procVarLabel = 'In/Out Mapping';
      else if (ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant'])) procVarLabel = 'In/Out Variables';
      else procVarLabel = 'Process Variables';

      newGroups.push(createSection({element, injector, translate}, 'procVars', procVarLabel, ProcVarGroup));

      // add the starter section
      if (is(element, 'bpmn:Process')) {
        newGroups.push(createSection({element, translate}, 'starter', 'Potential Starters', StarterProps));
      }

      // add the assignment section
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createSection({element, translate}, 'assignment', 'Assignment', AssignmentProps));
      }

      // add the scheduling section
      if (is(element, 'bpmn:UserTask') || is(element, 'bpmn:Process')) {
        newGroups.push(createSection({element, translate}, 'scheduling', 'Scheduling', SchedulingProps));
      }

      // add the role section
      if (is(element, 'bpmn:Lane')) {
        newGroups.push(createSection({element, translate}, 'role', 'APEX Role', RoleProps));
      }

      // add the call activity section
      if (is(element, 'bpmn:CallActivity')) {
        newGroups.push(createSection({element, translate}, 'callActivity', 'Called Diagram', CallActivityProps));
      }

      // add the custom timer section
      newGroups.push(createSection({element, translate}, 'customTimer', 'Timer', CustomTimerProps));

      // add all non-empty groups
      newGroups.forEach((g) => {
        if (typeof g.entries !== 'undefined' && g.entries.length > 0) groups.push(g);
      });
      
      groups = groups.filter(g => g.id !== 'timer');

      return groups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

apexPropertiesProvider.$inject = ['propertiesPanel', 'injector', 'translate'];
