var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

import { getSelectedEntry } from './procVarLists';

function isSelected(element, node) {
    return getSelectedEntry(element, node);
};

function notSelected(element, node) {
    return (typeof getSelectedEntry(element, node) == 'undefined');
}

var getProperty = function(property) {
    return function(element, node) {

        var entry = getSelectedEntry(element, node);

        return {
            [property]: (entry && entry.get(property)) || undefined
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

    // sequence field
    procVarProps.push(
        entryFactory.textField(translate, {
        id: 'varSequence',
        description: 'Execution sequence',
        label: 'Sequence',
        modelProperty: 'varSequence',

        get: getProperty('varSequence'),

        set: setProperty(),

        hidden: notSelected()
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

            set: setProperty(),

            hidden: notSelected()
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
            ],

            hidden: notSelected()
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
            ],

            hidden: notSelected()
        })
    );

    // expression
    procVarProps.push(
        entryFactory.textBox(translate, {
            id: 'varExpression',
            label: 'Expression',
            modelProperty: 'varExpression',

            get: getProperty('varExpression'),

            set: setProperty(),

            show: isSelected()
        })
    );

    return procVarProps;
}