import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import SubPropertiesHelper from '../../helper/subPropertiesHelper';
import extensionElementsEntry from './custom/ExtensionElements';

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

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
      if (e.type === 'pre' || e.type === 'post') {
        if (e.getSelected(element, node).idx > -1) {
          selection = e.getSelected(element, node);
          entry =
            e.type === 'pre' ? preSubPropertiesHelper.getEntries(element)[selection.idx] : postSubPropertiesHelper.getEntries(element)[selection.idx];
        }
      }
    });
  }

  return entry;
}

export function procVarLists(
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate,
  options
) {
  var type1;
  var label1;
  var name1;

  var type2;
  var label2;
  var name2;

  var loadDefinedVariables = function () {
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;
    if (!extensions) {
      new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
        SubPropertiesHelper.createExtensionElement(element, bpmnFactory).context
      );
    }
    extensions = bo.extensionElements;

    if (typeof apex !== 'undefined') {
      // ajaxIdentifier
      var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
      // ajax process
      apex.server
        .plugin(
          ajaxIdentifier,
          {
            x01: 'GET_VARIABLE_MAPPING',
            x02: bo.calledDiagram,
            x03: bo.calledDiagramVersionSelection,
            x04: bo.calledDiagramVersion,
          },
          {}
        )
        .then((pData) => {
          const handler = new MultiCommandHandler(commandStack);
          if (pData.InVariables) {
            pData.InVariables.forEach((v) => {
              handler.preExecute(
                preSubPropertiesHelper.newElement(
                  element,
                  extensions,
                  bpmnFactory,
                  {
                    varSequence:
                      preSubPropertiesHelper.getNextSequence(element),
                    varName: v.varName,
                    varDataType: v.varDataType,
                    varExpression: '',
                    varExpressionType: 'static',
                    varDescription: v.varDescription,
                  }
                )
              );
            });
          }
          if (pData.OutVariables) {
            pData.OutVariables.forEach((v) => {
              handler.preExecute(
                postSubPropertiesHelper.newElement(
                  element,
                  extensions,
                  bpmnFactory,
                  {
                    varSequence:
                      postSubPropertiesHelper.getNextSequence(element),
                    varName: v.varName,
                    varDataType: v.varDataType,
                    varExpression: '',
                    varExpressionType: 'static',
                    varDescription: v.varDescription,
                  }
                )
              );
            });
          }
        });
    }
  };

  var copyBusinessRef = function () {
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;
    if (!extensions) {
      new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
        SubPropertiesHelper.createExtensionElement(element, bpmnFactory).context
      );
    }
    extensions = bo.extensionElements;

    const handler = new MultiCommandHandler(commandStack);
    handler.preExecute(
      preSubPropertiesHelper.newElement(element, extensions, bpmnFactory, {
        varSequence: preSubPropertiesHelper.getNextSequence(element),
        varName: 'BUSINESS_REF',
        varDataType: 'VARCHAR2',
        varExpression: '&F4A$BUSINESS_REF.',
        varExpressionType: 'processVariable',
      })
    );
  };

  procVarProps = [];

  if (is(element, 'bpmn:CallActivity')) {
    // load variables
    procVarProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-load-variables',
        buttonLabel: translate('Load defined variables'),
        handleClick: function (element, node, event) {
          loadDefinedVariables();
        },
      })
    );

    // business ref quick pick
    procVarProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-business-ref',
        buttonLabel: translate('Copy business reference'),
        handleClick: function (element, node, event) {
          copyBusinessRef();
        },
      })
    );
  }

  if (options.type1) {
    ({ type1, label1, name1 } = options);

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
        var procOrPart =
          is(element, 'bpmn:Process') || is(element, 'bpmn:Participant');
        return preSubPropertiesHelper.newElement(
          element,
          extensionElements,
          bpmnFactory,
          {
            ...(!procOrPart && {
              varSequence: preSubPropertiesHelper.getNextSequence(element),
            }),
            varName: preSubPropertiesHelper.getIndexedName(
              element,
              translate(name1),
              'varName'
            ),
            varDataType: 'VARCHAR2',
            ...(procOrPart && { varDescription: '' }),
            ...(!procOrPart && { varExpression: '' }),
            ...(!procOrPart && { varExpressionType: 'static' }),
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
        if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
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
  } else {
    preProcessVariables = null;
  }

  if (options.type2) {
    ({ type2, label2, name2 } = options);

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
        var procOrPart =
          is(element, 'bpmn:Process') || is(element, 'bpmn:Participant');
        return postSubPropertiesHelper.newElement(
          element,
          extensionElements,
          bpmnFactory,
          {
            ...(!procOrPart && {
              varSequence: postSubPropertiesHelper.getNextSequence(element),
            }),
            varName: postSubPropertiesHelper.getIndexedName(
              element,
              translate(name2),
              'varName'
            ),
            varDataType: 'VARCHAR2',
            ...(procOrPart && { varDescription: '' }),
            ...(!procOrPart && { varExpression: '' }),
            ...(!procOrPart && { varExpressionType: 'static' }),
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
        if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
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
  } else {
    postProcessVariables = null;
  }

  return procVarProps;
}
