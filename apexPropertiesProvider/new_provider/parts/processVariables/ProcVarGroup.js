import { ListGroup } from '@bpmn-io/properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ProcVarList from './ProcVarList';

export default function (element, injector) {
  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
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
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway')
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
