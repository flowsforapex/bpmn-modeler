import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

// element identifier for current element
var elementIdentifier;

// select list options container
var diagrams = [];
// var diagrams = [
//   { name: 'diagram1', value: 'diagram1' },
//   { name: 'diagram2', value: 'diagram2' },
// ];

// select box container
var diagramSelectBox;

// loading flags
var diagramsLoading;

function enableAndResetValue(element, field, property) {
  // get dom node
  var fieldNode = domQuery(`select[name="${field.id}"]`);
  if (fieldNode) {
    // enable select box
    fieldNode.removeAttribute('disabled');
    // refresh select box options
    field.setControlValue(element, null, fieldNode, null, property);
    // return new selected value
    return fieldNode.value;
  }
  return null;
}

function refreshDiagrams(element) {
  var property;
  var newDiagramName;
  // loading flag
  diagramsLoading = true;
  // ajax process
  getDiagrams(applicationId).then((values) => {
    diagrams = values;
    // loading flag
    diagramsLoading = false;
    // get property value
    property = getBusinessObject(element).get('calledDiagram') || null;
    // add entry if not contained
    if (property != null && !diagrams.map(e => e.value).includes(property)) {
      diagrams.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newDiagramName = enableAndResetValue(element, diagramSelectBox, property);
  });
}

export default function (
  group,
  elementRegistry,
  bpmnFactory,
  element,
  translate
) {
  var versioning = [
    { name: 'Latest version', value: 'latestVersion' },
    { name: 'Named Version', value: 'namedVersion' },
  ];

  if (is(element, 'bpmn:CallActivity')) {
    // Diagram Name
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'calledDiagram',
        description: translate('Select the diagram containing the SubProcess'),
        label: translate('Diagram Name'),
        modelProperty: 'calledDiagram',
        selectOptions: function () {
          return diagrams;
        },
        get: function (element) {
          // refresh diagrams (if necessary)
          if (elementIdentifier !== element) {
            elementIdentifier = element;
            // initiate ajax call for meta data // TODO ajax call schreiben
            refreshDiagrams(element);
          }
          var value = getBusinessObject(element).get(
            'calledDiagramVersionSelection'
          );
          // add entry if not contained // TODO check: warum hier und oben? -> Fallback wenn zwischen manualInput + metadata gewechselt?
          if (value != null && !diagrams.map(e => e.value).includes(value)) {
            // filter out old custom entries
            diagrams = diagrams.filter(a => !a.name.endsWith('*'));
            // add entry
            diagrams.unshift({
              name: `${value}*`,
              value: value,
            });
          }
          return value;
        },
      })
    );

    // Versioning
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'calledDiagramVersionSelection',
        description: translate('Specify which diagram version to use'),
        label: translate('Versioning'),
        modelProperty: 'calledDiagramVersionSelection',
        selectOptions: versioning,
        set: function (element, values) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, values);
        },
        get: function (element) {
          var bo = getBusinessObject(element);
          var value = bo.get('calledDiagramVersionSelection');

          if (
            typeof value === 'undefined' ||
            !versioning.some(v => v.value === value)
          ) {
            var command = cmdHelper.updateBusinessObject(element, bo, {
              calledDiagramVersionSelection: 'latestVersion',
            });
            new UpdateBusinessObjectHandler(
              elementRegistry,
              bpmnFactory
            ).execute(command.context);
          }

          return {
            calledDiagramVersionSelection: bo.get(
              'calledDiagramVersionSelection'
            ),
          };
        },
      })
    );

    // Version
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'calledDiagramVersion',
        label: translate('Version name'),
        modelProperty: 'calledDiagramVersion',
        selectOptions: versioning,
        hidden: function (element) {
          return (
            typeof getBusinessObject(element).get(
              'calledDiagramVersionSelection'
            ) === 'undefined' ||
            getBusinessObject(element).get('calledDiagramVersionSelection') !==
              'namedVersion'
          );
        },
      })
    );
  }
}
