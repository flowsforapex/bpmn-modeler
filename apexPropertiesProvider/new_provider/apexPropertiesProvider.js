import { is } from 'bpmn-js/lib/util/ModelUtil';
import procVarGroup from './parts/processVariables/ProcVarGroup';
import executePlsqlProps from './parts/scriptTask/ExecutePlsqlProps';
import apexPageProps from './parts/userTask/ApexPageProps';
import apexApprovalProps from './parts/userTask/ApprovalTaskProps';

import customTimerProps from './custom/CustomTimerProps';
import taskTypeProps from './parts/TaskTypeProps';

import assignmentProps from './parts/assignment/AssignmentProps';

import executionProps from './parts/process/ExecutionProps';

import roleProps from './parts/lanes/RoleProps';
import schedulingProps from './parts/scheduling/SchedulingProps';

import callActivityProps from './parts/callActivity/CallActivityProps';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

var domQuery = require('min-dom').query;

const LOW_PRIORITY = 500;

function createApexPageSection(element, injector, translate) {
  const apexPageSection = {
    id: 'apexPage',
    label: translate('APEX Page'),
    entries: apexPageProps(element, injector),
  };

  return apexPageSection;
}

function createApexApprovalSection(element, translate) {
  const apexApprovalSection = {
    id: 'apexApproval',
    label: translate('APEX Approval'),
    entries: apexApprovalProps(element),
  };

  return apexApprovalSection;
}

function createPlsqlSection(element, translate) {
  const plsqlSection = {
    id: 'executePlsql',
    label: translate('PL/SQL'),
    entries: executePlsqlProps(element),
  };

  return plsqlSection;
}

function createProcVarSection(element, injector, translate) {
  const procVarSection = {
    id: 'procVars',
    label: translate('Process Variables'),
    entries: procVarGroup(element, injector),
  };

  return procVarSection;
}

function createCustomTimerSection(element, translate) {
  const customTimerSection = {
    id: 'customTimer',
    label: translate('Timer'),
    entries: customTimerProps(element),
  };

  return customTimerSection;
}

function createTaskTypeSection(element, translate) {
  const taskTypeSection = {
    id: 'taskType',
    label: translate('Task Type'),
    entries: taskTypeProps(element),
  };

  return taskTypeSection;
}

function createAssignmentSection(element, translate) {
  const assignmentSection = {
    id: 'assignment',
    label: translate('Assignment'),
    entries: assignmentProps(element),
  };

  return assignmentSection;
}

function createExecutionSection(element, translate) {
  const executionSection = {
    id: 'execution',
    label: translate('Execution'),
    entries: executionProps(element),
  };

  return executionSection;
}

function createSchedulingSection(element, translate) {
  const schedulingSection = {
    id: 'scheduling',
    label: translate('Scheduling'),
    entries: schedulingProps(element),
  };

  return schedulingSection;
}

function createRoleSection(element, translate) {
  const roleSection = {
    id: 'role',
    label: translate('APEX Role'),
    entries: roleProps(element),
  };

  return roleSection;
}

function createCallActivitySection(element, translate) {
  const callActivitySection = {
    id: 'callActivity',
    label: translate('Called Diagram'),
    entries: callActivityProps(element),
  };

  return callActivitySection;
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
    mouseX = event.x;
    var panelWidth = parentNode.scrollWidth + dx;
    var maxWidth =
      (parseInt(getComputedStyle(canvas, '').width) / 100) *
      parseInt(getComputedStyle(parentNode).maxWidth);
    if (
      panelWidth >= parseInt(getComputedStyle(parentNode).minWidth) &&
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

      if (ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask'])) {
        newGroups.push(createTaskTypeSection(element, translate));
      }

      // add the apexPage section
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createApexPageSection(element, injector, translate));
        newGroups.push(createApexApprovalSection(element, translate));
      }

      // add the plsql section
      if (is(element, 'bpmn:ScriptTask')) {
        newGroups.push(createPlsqlSection(element, translate));
      }

      // add the procVar section (filtering done inside)
      newGroups.push(createProcVarSection(element, injector, translate));

      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createAssignmentSection(element, translate));
      }

      // add the process section
      if (is(element, 'bpmn:Process')) {
        newGroups.push(createExecutionSection(element, translate));
      }

      // add the scheduling section
      if (is(element, 'bpmn:UserTask') || is(element, 'bpmn:Process')) {
        newGroups.push(createSchedulingSection(element, translate));
      }

      // add the role section
      if (is(element, 'bpmn:Lane')) {
        newGroups.push(createRoleSection(element, translate));
      }

      // add the call activity section
      if (is(element, 'bpmn:CallActivity')) {
        newGroups.push(createCallActivitySection(element, translate));
      }

      // add the custom timer section
      newGroups.push(createCustomTimerSection(element, translate));

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
