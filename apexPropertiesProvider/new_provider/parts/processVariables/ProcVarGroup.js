import { ListGroup } from '@bpmn-io/properties-panel';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ProcVarList from './ProcVarList';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function (element, injector) {
  if (
    ModelingUtil.isAny(element, ['bpmn:Task', 'bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:ManualTask'])
  ) {
    return [
      {
        id: 'beforeTask',
        element,
        label: 'Before Task',
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          new ListExtensionHelper(
            'apex:BeforeTask',
            null,
            'procVars',
            'apex:ProcessVariable',
            null
          )
        ),
      },
      {
        id: 'afterTask',
        element,
        label: 'After Task',
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          new ListExtensionHelper(
            'apex:AfterTask',
            null,
            'procVars',
            'apex:ProcessVariable',
            null
          )
        ),
      },
    ];
  } else if (
    ModelingUtil.isAny(element, ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway', 'bpmn:EventBasedGateway'])
  ) {
    // opening gateway
    if (element.incoming.length === 1 && element.outgoing.length > 1) {
      return [
        {
          id: 'beforeSplit',
          element,
          label: 'Before Split',
          component: ListGroup,
          ...ProcVarList(
            { element, injector },
            new ListExtensionHelper(
              'apex:BeforeSplit',
              null,
              'procVars',
              'apex:ProcessVariable',
              null
            )
          ),
        },
      ];
      // closing gateway
    } else if (element.incoming.length > 1 && element.outgoing.length === 1) {
      return [
        {
          id: 'afterMerge',
          element,
          label: 'After Merge',
          component: ListGroup,
          ...ProcVarList(
            { element, injector },
            new ListExtensionHelper(
              'apex:AfterMerge',
              null,
              'procVars',
              'apex:ProcessVariable',
              null
            )
          ),
        },
      ];
      // opening and closing gateway
    } else if (element.incoming.length > 1 && element.outgoing.length > 1) {
      return [
        {
          id: 'beforeSplit',
          element,
          label: 'Before Split',
          component: ListGroup,
          ...ProcVarList(
            { element, injector },
            new ListExtensionHelper(
              'apex:BeforeSplit',
              null,
              'procVars',
              'apex:ProcessVariable',
              null
            )
          ),
        },
        {
          id: 'afterMerge',
          element,
          label: 'After Merge',
          component: ListGroup,
          ...ProcVarList(
            { element, injector },
            new ListExtensionHelper(
              'apex:AfterMerge',
              null,
              'procVars',
              'apex:ProcessVariable',
              null
            )
          ),
        },
      ];
    }
  }
  return [];
}
