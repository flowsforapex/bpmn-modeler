import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { getDiagrams } from '../../plugins/metaDataCollector';

var domQuery = require('min-dom').query;
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

// element identifier for current element
var elementIdentifier;

// select list options container
var diagrams = [];

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
  getDiagrams().then((values) => {
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
  element,
  bpmnFactory,
  elementRegistry,
  translate
) {
  var versioning = [
    { name: 'Latest version', value: 'latestVersion' },
    { name: 'Named Version', value: 'namedVersion' },
  ];

  if (is(element, 'bpmn:CallActivity')) {
    // manualInput switch
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'inputSelection',
        label: translate('Input'),
        selectOptions: [
          { name: translate('Use F4A meta data'), value: 'false' },
          { name: translate('Manual input'), value: 'true' },
        ],
        modelProperty: 'manualInput',

        get: function (element) {
          var bo = getBusinessObject(element);
          var value = bo.get('manualInput');

          if (typeof value === 'undefined') {
            var command = cmdHelper.updateBusinessObject(element, bo, {
              manualInput: 'false',
            });
            new UpdateBusinessObjectHandler(
              elementRegistry,
              bpmnFactory
            ).execute(command.context);
          }

          return {
            manualInput: bo.get('manualInput'),
          };
        },

        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, values);
        },
      })
    );

    // diagram select list
    diagramSelectBox = entryFactory.selectBox(translate, {
      id: 'calledDiagram',
      description: translate('Name of the diagram'),
      label: translate('Called Diagram'),
      modelProperty: 'calledDiagram',
      selectOptions: function () {
        return diagrams;
      },
      get: function (element) {
        // refresh diagrams (if necessary)
        if (elementIdentifier !== element) {
          elementIdentifier = element;
          // initiate ajax call for meta data
          refreshDiagrams(element);
        }
        var value = getBusinessObject(element).get('calledDiagram');
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
        return {
          calledDiagram: value,
        };
      },
      hidden: function () {
        return getBusinessObject(element).manualInput === 'true';
      },
    });

    group.entries.push(diagramSelectBox);

    // diagram text field
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'calledDiagramText',
        description: translate('Name of the diagram'),
        label: translate('Called Diagram'),
        modelProperty: 'calledDiagram',

        hidden: function (element) {
          return getBusinessObject(element).manualInput === 'false';
        },
      })
    );

    // Versioning
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'calledDiagramVersionSelection',
        description: translate('Used diagram version'),
        label: translate('Versioning'),
        modelProperty: 'calledDiagramVersionSelection',
        selectOptions: versioning,
        set: function (element, values) {
          var bo = getBusinessObject(element);
          // reset invalid value
          if (values.calledDiagramVersionSelection === 'latestVersion') {
            values.calledDiagramVersion = undefined;
          }
          return cmdHelper.updateBusinessObject(element, bo, values);
        },
        get: function (element) {
          var bo = getBusinessObject(element);
          var value = bo.get('calledDiagramVersionSelection');

          if (typeof value === 'undefined') {
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
            getBusinessObject(element).get('calledDiagramVersionSelection') !==
            'namedVersion'
          );
        },
      })
    );
  }
}
