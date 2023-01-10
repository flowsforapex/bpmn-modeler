import {
  HeaderButton,
  ListGroup
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ProcVarList from './ProcVarList';

import { getDefinedVariables } from '../../plugins/metaDataCollector';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function (element, injector, translate) {
  if (
    ModelingUtil.isAny(element, ['bpmn:Task', 'bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:ManualTask'])
  ) {
    const listExtensionHelper1 = new ListExtensionHelper(
      'apex:BeforeTask',
      null,
      'procVars',
      'apex:ProcessVariable',
      null
    );

    const listExtensionHelper2 = new ListExtensionHelper(
      'apex:AfterTask',
      null,
      'procVars',
      'apex:ProcessVariable',
      null
    );

    return [
      {
        id: 'beforeTask',
        element,
        label: translate('Before Task'),
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          listExtensionHelper1
        ),
      },
      {
        id: 'afterTask',
        element,
        label: translate('After Task'),
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          listExtensionHelper2
        ),
      },
    ];
  } else if (
    ModelingUtil.is(element, 'bpmn:CallActivity')
  ) {
    const listExtensionHelper1 = new ListExtensionHelper(
      'apex:InVariables',
      null,
      'procVars',
      'apex:ProcessVariable',
      null
    );

    const listExtensionHelper2 = new ListExtensionHelper(
      'apex:OutVariables',
      null,
      'procVars',
      'apex:ProcessVariable',
      null
    );

    return [
      {
        id: 'quickpickDefinedVariables',
        element,
        component: QuickpickDefinedVariables,
        helper1: listExtensionHelper1,
        helper2: listExtensionHelper2
      },
      {
        id: 'quickpickBusinessRef',
        element,
        component: QuickpickBusinessRef,
        helper: listExtensionHelper1
      },
      {
        id: 'inVariables',
        element,
        label: translate('In Variables'),
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          listExtensionHelper1
        ),
      },
      {
        id: 'outVariables',
        element,
        label: translate('Out Variables'),
        component: ListGroup,
        ...ProcVarList(
          { element, injector },
          listExtensionHelper2
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
          label: translate('Before Split'),
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
          label: translate('After Merge'),
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
          label: translate('Before Split'),
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
          label: translate('After Merge'),
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

function QuickpickDefinedVariables(props) {
  const { element, id, helper1, helper2 } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  return new HeaderButton({
    id: id,
    children: translate('Load defined variables'),
    onClick: function () {
      const {calledDiagram, calledDiagramVersionSelection, calledDiagramVersion} = element.businessObject;

      getDefinedVariables(calledDiagram, calledDiagramVersionSelection, calledDiagramVersion)
      .then((data) => {
        if (data.InVariables) {
          data.InVariables.forEach((v) => {
            helper1.addSubElement(
              { element, bpmnFactory, commandStack },
              {
                varSequence: helper1.getNextSequence(element),
                varName: v.varName,
                varDataType: v.varDataType,
                varExpressionType: 'static',
                varExpression: '',
                varDescription: v.varDescription,
              }
            );
          });
        }
        if (data.OutVariables) {
          data.OutVariables.forEach((v) => {
            helper2.addSubElement(
              { element, bpmnFactory, commandStack },
              {
                varSequence: helper2.getNextSequence(element),
                varName: v.varName,
                varDataType: v.varDataType,
                varExpressionType: 'static',
                varExpression: '',
                varDescription: v.varDescription,
              }
            );
          });
        }
      });
    },
  });
}

function QuickpickBusinessRef(props) {
  const { element, id, helper } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  return new HeaderButton({
    id: id,
    children: translate('Copy business reference'),
    onClick: function () {
      helper.addSubElement(
        { element, bpmnFactory, commandStack },
        {
          varSequence: helper.getNextSequence(element),
          varName: 'BUSINESS_REF',
          varDataType: 'VARCHAR2',
          varExpressionType: 'processVariable',
          varExpression: 'BUSINESS_REF',
        }
      );
    },
  });
}