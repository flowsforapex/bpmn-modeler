import subPropertiesHelper from '../../extensionElements/subPropertiesHelper';

var extensionElementsEntry = require('./custom/ExtensionElements');

var procVarProps = [];
var preProcessVariables;
var postProcessVariables;

var preSubPropertiesHelper;
var postSubPropertiesHelper;

export function isSelected(element, node) {
  return typeof getSelectedEntry(element, node) !== 'undefined';
}

export function getSelectedEntry(element, node) {
  return (
    preSubPropertiesHelper.getSelectedEntry(
      preProcessVariables,
      element,
      node
    ) ||
    postSubPropertiesHelper.getSelectedEntry(
      postProcessVariables,
      element,
      node
    )
  );
}

export function procVarLists(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
  options
) {
  procVarProps = [];

  if (options.type1) {
    var { type1 } = options;
    var { label1 } = options;

    preSubPropertiesHelper = new subPropertiesHelper(
      `apex:${type1}`,
      'apex:ProcessVariable',
      'procVars'
    );

    // create first list element
    preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type1,
      label: label1,

      createExtensionElement: function (element, extensionElements, values) {
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
        preSubPropertiesHelper.setOptionLabelValue(
          element,
          option,
          'varName',
          'varExpression',
          'varName',
          idx
        );
      },

      onEntryMoved: function (element) {
        var entries = preSubPropertiesHelper.getEntries(element);
        entries.forEach((e, i) => e.set('varSequence', String(i)));
      },
    });

    procVarProps.push(preProcessVariables);
  }

  if (options.type2) {
    var { type2 } = options;
    var { label2 } = options;

    postSubPropertiesHelper = new subPropertiesHelper(
      `apex:${type2}`,
      'apex:ProcessVariable',
      'procVars'
    );

    // create second list element
    postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type2,
      label: label2,

      createExtensionElement: function (element, extensionElements, values) {
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
        postSubPropertiesHelper.setOptionLabelValue(
          element,
          option,
          'varName',
          'varExpression',
          'varName',
          idx
        );
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
