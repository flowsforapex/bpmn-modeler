var is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('./helper/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

import { getSelectedEntry } from './procVarLists';

// var EXPRESSION_LABEL = {
//     static: 'Static',
//     processVariable: 'Process Variable',
//     pageItem: 'Page Item',
//     sqlQuerySingle: 'SQL query',
//     sqlQueryList: 'SQL query',
//     plsqlExpression: 'PLSQL Code',
//     plsqlFunctionBody: 'PLSQL Code'
// }

var EXPRESSION_DESCRIPTION = {
    static: 'Static value',
    processVariable: 'Name of the Process Variable',
    pageItem: 'Name of the APEX Page Item',
    sqlQuerySingle: 'SQL query returning a single value',
    sqlQueryList: 'SQL query returning a colon delimited list',
    plsqlExpression: 'PLSQL Expression',
    plsqlFunctionBody: 'PLSQL Function Body'
}

var getProperty = function(property) {
    return function(element, node) {

        var entry = getSelectedEntry(element, node);

        return {
            [property]: (entry && entry.get(property)) || undefined,
            //varExpressionDynamicLabel: EXPRESSION_LABEL[entry && entry.get('varExpressionType')],
            varExpressionDynamicDescription: EXPRESSION_DESCRIPTION[entry && entry.get('varExpressionType')],
        }
    }
}

var setProperty = function() {
    return function(element, values, node) {
    var entry = getSelectedEntry(element, node);

    return cmdHelper.updateBusinessObject(element, entry, values);
    }
}

export function procVarDetailProps(element, bpmnFactory, translate) {

    var procVarProps = [];

    if (
        // task elements
        is(element, 'bpmn:Task') ||
        is(element, 'bpmn:UserTask') ||
        is(element, 'bpmn:ScriptTask') ||
        is(element, 'bpmn:ServiceTask') ||
        is(element, 'bpmn:ManualTask') ||
        // gateway elements
        is(element, 'bpmn:ExclusiveGateway') ||
        is(element, 'bpmn:ParallelGateway') ||
        is(element, 'bpmn:InclusiveGateway') ||
        is(element, 'bpmn:EventBasedGateway') ||
        // event elements
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:IntermediateThrowEvent') ||
        is(element, 'bpmn:IntermediateCatchEvent') ||
        is(element, 'bpmn:BoundaryEvent') ||
        is(element, 'bpmn:EndEvent')
      ) {

        // sequence field
        procVarProps.push(
            entryFactory.textField(translate, {
            id: 'varSequence',
            description: 'Execution sequence',
            label: 'Sequence',
            modelProperty: 'varSequence',

            get: getProperty('varSequence'),

            set: setProperty()
            })
        );

        // name field
        procVarProps.push(
            entryFactory.textField(translate, {
                id: 'varName',
                description: 'Variable name',
                label: 'Name',
                modelProperty: 'varName',

                get: getProperty('varName'),

                set: setProperty()
            })
        );

        // datatype field
        procVarProps.push(
            entryFactory.selectBox(translate, {
                id: 'varDataType',
                description: 'Data Type',
                label: 'Data Type',
                modelProperty: 'varDataType',

                get: getProperty('varDataType'),

                set: setProperty(),

                selectOptions: [
                    {name: 'Varchar2', value: 'varchar2'},
                    {name: 'Number', value: 'number'},
                    {name: 'Date', value: 'date'},
                    {name: 'Clob', value: 'clob'},
                ]
            })
        );

        // expression type
        procVarProps.push(
            entryFactory.selectBox(translate, {
                id: 'varExpressionType',
                label: 'Expression Type',
                modelProperty: 'varExpressionType',

                get: getProperty('varExpressionType'),

                set: setProperty(),

                selectOptions: [
                    {name: 'Static', value: 'static'},
                    {name: 'Process Variable', value: 'processVariable'},
                    {name: 'Page Item', value: 'pageItem'},
                    {name: 'SQL query (single value)', value: 'sqlQuerySingle'},
                    {name: 'SQL query (colon delimited list)', value: 'sqlQueryList'},
                    {name: 'PLSQL Expression', value: 'plsqlExpression'},
                    {name: 'PLSQL Function Body', value: 'plsqlFunctionBody'},
                ]
            })
        );

        // expression
        procVarProps.push(
            entryFactory.dynamicTextBox(translate, {
                id: 'varExpression',
                label: 'Expression',
                modelProperty: 'varExpression',
                //dataValueLabel: 'varExpressionDynamicLabel',
                dataValueDescription: 'varExpressionDynamicDescription',

                get: getProperty('varExpression'),

                set: setProperty()
            })
        );
    }

    return procVarProps;
}