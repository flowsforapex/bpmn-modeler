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

function createApexApprovalSection(element, injector, translate) {
  const apexApprovalSection = {
    id: 'apexApproval',
    label: translate('APEX Approval'),
    entries: apexApprovalProps(element, injector),
  };

  return apexApprovalSection;
}

function createPlsqlSection(element, injector, translate) {
  const plsqlSection = {
    id: 'executePlsql',
    label: translate('PL/SQL'),
    entries: executePlsqlProps(element, injector),
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

function createCustomTimerSection(element, injector, translate) {
  const customTimerSection = {
    id: 'customTimer',
    label: translate('Timer'),
    entries: customTimerProps(element, injector),
  };

  return customTimerSection;
}

function createTaskTypeSection(element, injector, translate) {
  const taskTypeSection = {
    id: 'taskType',
    label: translate('Task Type'),
    entries: taskTypeProps(element, injector),
  };

  return taskTypeSection;
}

function createAssignmentSection(element, injector, translate) {
  const assignmentSection = {
    id: 'assignment',
    label: translate('Assignment'),
    entries: assignmentProps(element, injector),
  };

  return assignmentSection;
}

function createExecutionSection(element, injector, translate) {
  const executionSection = {
    id: 'execution',
    label: translate('Execution'),
    entries: executionProps(element, injector),
  };

  return executionSection;
}

function createSchedulingSection(element, injector, translate) {
  const schedulingSection = {
    id: 'scheduling',
    label: translate('Scheduling'),
    entries: schedulingProps(element, injector),
  };

  return schedulingSection;
}

function createRoleSection(element, injector, translate) {
  const roleSection = {
    id: 'role',
    label: translate('APEX Role'),
    entries: roleProps(element, injector),
  };

  return roleSection;
}

export default function apexPropertiesProvider(
  propertiesPanel,
  injector,
  translate
) {
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

  this.getGroups = function (element) {
    return function (groups) {
      const newGroups = [];

      newGroups.push(createTaskTypeSection(element, injector, translate));

      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createAssignmentSection(element, injector, translate));
      }

      // add the apexPage section
      if (is(element, 'bpmn:UserTask')) {
        newGroups.push(createApexPageSection(element, injector, translate));
        newGroups.push(createApexApprovalSection(element, injector, translate));
      }

      // add the plsql section
      if (is(element, 'bpmn:ScriptTask')) {
        newGroups.push(createPlsqlSection(element, injector, translate));
      }

      // add the procVar section
      newGroups.push(createProcVarSection(element, injector, translate));

      // add the custom timer section
      newGroups.push(createCustomTimerSection(element, injector, translate));

      // add the process section
      if (is(element, 'bpmn:Process')) {
        newGroups.push(createExecutionSection(element, injector, translate)); // check passing translate even needed here?
      }

      // add the scheduling section
      if (is(element, 'bpmn:UserTask') || is(element, 'bpmn:Process')) {
        newGroups.push(createSchedulingSection(element, injector, translate));
      }

      // add the role section
      if (is(element, 'bpmn:Lane')) {
        newGroups.push(createRoleSection(element, injector, translate));
      }
      

      /** *** filter *****/

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
