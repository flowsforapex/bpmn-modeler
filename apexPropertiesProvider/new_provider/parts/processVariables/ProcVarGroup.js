import {
  ListGroup
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ProcVarList from './ProcVarList';

import { getDefinedVariables } from '../../plugins/metaDataCollector';

import { Quickpick } from '../../helper/Quickpick';

var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');

export default function (args) {
  var type1 = null;
  var type2 = null;

  const {element, injector, translate} = args;

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (
    ModelingUtil.isAny(element, ['bpmn:Task', 'bpmn:UserTask', 'bpmn:ScriptTask', 'bpmn:ServiceTask', 'bpmn:ManualTask'])
  ) {

    type1 = {
      type: 'apex:BeforeTask',
      id: 'beforeTask',
      label: 'Before Task'
    };

    type2 = {
      type: 'apex:AfterTask',
      id: 'afterTask',
      label: 'After Task'
    };
    
  } else if (
    ModelingUtil.is(element, 'bpmn:CallActivity')
  ) {

    type1 = {
      type: 'apex:InVariables',
      id: 'inVariables',
      label: 'In Variables',
      name: 'In'
    };

    type2 = {
      type: 'apex:OutVariables',
      id: 'outVariables',
      label: 'Out Variables',
      name: 'Out'
    };

  } else if (
    ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:Participant']) && businessObject.isCallable === 'true'
  ) {

    type1 = {
      type: 'apex:InVariables',
      id: 'inVariables',
      label: 'In Variables',
      name: 'In'
    };

    type2 = {
      type: 'apex:OutVariables',
      id: 'outVariables',
      label: 'Out Variables',
      name: 'Out'
    };

  } else if (
    ModelingUtil.isAny(element, ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway', 'bpmn:EventBasedGateway'])
  ) {
    // opening gateway
    if (element.incoming.length === 1 && element.outgoing.length > 1) {

      type1 = {
        type: 'apex:BeforeSplit',
        id: 'beforeSplit',
        label: 'Before Split'
      };

      // closing gateway
    } else if (element.incoming.length > 1 && element.outgoing.length === 1) {

      type1 = {
        type: 'apex:AfterMerge',
        id: 'afterMerge',
        label: 'After Merge'
      };

      // opening and closing gateway
    } else if (element.incoming.length > 1 && element.outgoing.length > 1) {

      type1 = {
        type: 'apex:BeforeSplit',
        id: 'beforeSplit',
        label: 'Before Split'
      };
  
      type2 = {
        type: 'apex:AfterMerge',
        id: 'afterMerge',
        label: 'After Merge'
      };
      
    }
  } else if (
    ModelingUtil.isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent', 'bpmn:EndEvent'])
  ) {

    if (
      getBusinessObject(element).eventDefinitions &&
      getBusinessObject(element).eventDefinitions.some(
        e => e.$type === 'bpmn:TimerEventDefinition'
      )
    ) {
      type1 = {
        type: 'apex:BeforeEvent',
        id: 'beforeEvent',
        label: 'Before Event'
      };
    }

    type2 = {
      type: 'apex:OnEvent',
      id: 'onEvent',
      label: 'On Event'
    }; 
  }

  const listExtensionHelper1 = type1 ? new ListExtensionHelper(
    type1.type,
    null,
    'procVars',
    'apex:ProcessVariable',
    null,
    type1.name
  ) : null;

  const listExtensionHelper2 = type2 ? new ListExtensionHelper(
    type2.type,
    null,
    'procVars',
    'apex:ProcessVariable',
    null,
    type2.name
  ) : null;

  if (
    ModelingUtil.is(element, 'bpmn:CallActivity')
  ) {
    entries.push(
      {
        id: 'quickpickDefinedVariables',
        element,
        component: QuickpickDefinedVariables,
        helper1: listExtensionHelper1,
        helper2: listExtensionHelper2
      },
    );
    entries.push(
      {
        id: 'quickpickBusinessRef',
        element,
        component: QuickpickBusinessRef,
        helper: listExtensionHelper1
      },
    );
  }

  if (type1) {
    entries.push({
      id: type1.id,
      element,
      label: translate(type1.label),
      component: ListGroup,
      ...ProcVarList(
        {
          element,
          injector,
          helper: listExtensionHelper1
        }
      ), 
    });
  }

  if (type2) {
    entries.push({
      id: type2.id,
      element,
      label: translate(type2.label),
      component: ListGroup,
      ...ProcVarList(
        {
          element,
          injector,
          helper: listExtensionHelper2
        }
      ), 
    });
  }

  return entries;
}

function QuickpickDefinedVariables(props) {
  const { element, id, helper1, helper2 } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  const businessObject = getBusinessObject(element);

  return Quickpick(
    {
      text: translate('Load defined variables'),
      handler: () => {
        const {calledDiagram, calledDiagramVersionSelection, calledDiagramVersion} = businessObject;

        getDefinedVariables(calledDiagram, calledDiagramVersionSelection, calledDiagramVersion)
        .then((data) => {
          if (data.InVariables) {
            data.InVariables.forEach((v) => {
              helper1.addSubElement({
                element,
                modeling,
                bpmnFactory,
                newProps: {
                  varSequence: helper1.getNextSequence(element),
                  varName: v.varName,
                  varDataType: v.varDataType,
                  varExpressionType: 'static',
                  varExpression: '',
                  varDescription: v.varDescription,
                }
              });
            });
          }
          if (data.OutVariables) {
            data.OutVariables.forEach((v) => {
              helper2.addSubElement({
                element,
                modeling,
                bpmnFactory,
                newProps: {
                  varSequence: helper2.getNextSequence(element),
                  varName: v.varName,
                  varDataType: v.varDataType,
                  varExpressionType: 'static',
                  varExpression: '',
                  varDescription: v.varDescription,
                }
              });
            });
          }
        });
      }
    }
  );
}

function QuickpickBusinessRef(props) {
  const { element, id, helper } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  return Quickpick(
    {
      text: translate('Copy business reference'),
      handler: () => {
        helper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            varSequence: helper.getNextSequence(element),
            varName: 'BUSINESS_REF',
            varDataType: 'VARCHAR2',
            varExpressionType: 'processVariable',
            varExpression: 'BUSINESS_REF',
          }
        });
      }
    }
  );
}