import SubPropertiesHelper from '../../helper/subPropertiesHelper';

var { is } = require('bpmn-js/lib/util/ModelUtil');
var extensionElementsEntry = require('./custom/ExtensionElements');

var procVarProps = [];

var preSubPropertiesHelper;
var postSubPropertiesHelper;

var preProcessVariables;
var postProcessVariables;

export function isSelected(element, node) {
  return typeof getSelectedEntry(element, node) !== 'undefined';
}

export function getSelectedEntry(element, node) {
  var selection;
  var entry;

  if (element && procVarProps) {
    procVarProps.forEach((e) => {
      if (e.getSelected(element, node).idx > -1) {
        selection = e.getSelected(element, node);
        entry =
          e.type === 'pre' ? preSubPropertiesHelper.getEntries(element)[selection.idx] : postSubPropertiesHelper.getEntries(element)[selection.idx];
      }
    });
  }

  return entry;
}

export function procVarLists(element, bpmnFactory, translate, options) {
  var type1;
  var label1;

  var type2;
  var label2;

  procVarProps = [];

  if (options.type1) {
    ({ type1 } = options);
    ({ label1 } = options);

    preSubPropertiesHelper = new SubPropertiesHelper(
      `apex:${type1}`,
      'apex:ProcessVariable',
      'procVars'
    );

    // create first list element
    preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type1,
      label: label1,
      type: 'pre',

      createExtensionElement: function (element, extensionElements, values) {
        if (is(element, 'bpmn:Process')) {
          return preSubPropertiesHelper.newElement(
            element,
            extensionElements,
            bpmnFactory,
            {
              varName: preSubPropertiesHelper.getIndexedName(
                element,
                translate(type1),
                'varName'
              ),
              varDataType: 'VARCHAR2',
              varDescription: '',
            }
          );
        }
        return preSubPropertiesHelper.newElement(
          element,
          extensionElements,
          bpmnFactory,
          {
            varSequence: preSubPropertiesHelper.getNextSequence(element),
            varName: preSubPropertiesHelper.getIndexedName(
              element,
              translate(type1),
              'varName'
            ),
            varDataType: 'VARCHAR2',
            varExpression: '',
            varExpressionType: 'static',
          }
        );
      },
      removeExtensionElement: function (
        element,
        extensionElements,
        value,
        idx
      ) {
        return preSubPropertiesHelper.removeElement(
          element,
          extensionElements,
          idx
        );
      },

      getExtensionElements: function (element) {
        return preSubPropertiesHelper.getEntries(element);
      },

      onSelectionChange: function (element, node) {
        if (postProcessVariables) postProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: function (
        element,
        node,
        option,
        property,
        value,
        idx
      ) {
        if (is(element, 'bpmn:Process')) {
          preSubPropertiesHelper.setOptionLabelValue(
            element,
            option,
            'varName',
            'varDescription',
            'varName',
            idx
          );
        } else {
          preSubPropertiesHelper.setOptionLabelValue(
            element,
            option,
            'varName',
            'varExpression',
            'varName',
            idx
          );
        }
      },

      onEntryMoved: function (element) {
        var entries = preSubPropertiesHelper.getEntries(element);
        entries.forEach((e, i) => e.set('varSequence', String(i)));
      },
    });

    procVarProps.push(preProcessVariables);
  }

  if (options.type2) {
    ({ type2 } = options);
    ({ label2 } = options);

    postSubPropertiesHelper = new SubPropertiesHelper(
      `apex:${type2}`,
      'apex:ProcessVariable',
      'procVars'
    );

    // create second list element
    postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type2,
      label: label2,
      type: 'post',

      createExtensionElement: function (element, extensionElements, values) {
        if (is(element, 'bpmn:Process')) {
          return postSubPropertiesHelper.newElement(
            element,
            extensionElements,
            bpmnFactory,
            {
              varName: postSubPropertiesHelper.getIndexedName(
                element,
                translate(type2),
                'varName'
              ),
              varDataType: 'VARCHAR2',
              varDescription: '',
            }
          );
        }
        return postSubPropertiesHelper.newElement(
          element,
          extensionElements,
          bpmnFactory,
          {
            varSequence: postSubPropertiesHelper.getNextSequence(element),
            varName: postSubPropertiesHelper.getIndexedName(
              element,
              translate(type2),
              'varName'
            ),
            varDataType: 'VARCHAR2',
            varExpression: '',
            varExpressionType: 'static',
          }
        );
      },
      removeExtensionElement: function (
        element,
        extensionElements,
        value,
        idx
      ) {
        return postSubPropertiesHelper.removeElement(
          element,
          extensionElements,
          idx
        );
      },

      getExtensionElements: function (element) {
        return postSubPropertiesHelper.getEntries(element);
      },

      onSelectionChange: function (element, node) {
        if (preProcessVariables) preProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: function (
        element,
        node,
        option,
        property,
        value,
        idx
      ) {
        if (is(element, 'bpmn:Process')) {
          postSubPropertiesHelper.setOptionLabelValue(
            element,
            option,
            'varName',
            'varDescription',
            'varName',
            idx
          );
        } else {
          postSubPropertiesHelper.setOptionLabelValue(
            element,
            option,
            'varName',
            'varExpression',
            'varName',
            idx
          );
        }
      },

      onEntryMoved: function (element) {
        var entries = postSubPropertiesHelper.getEntries(element);
        entries.forEach((e, i) => e.set('varSequence', String(i)));
      },
    });

    procVarProps.push(postProcessVariables);
  }

  return procVarProps;
}
