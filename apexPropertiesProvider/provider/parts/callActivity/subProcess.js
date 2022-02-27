import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

export default function (
  group,
  elementRegistry,
  bpmnFactory,
  element,
  translate
) {
  var diagrams = [
    { name: 'diagram1', value: 'diagram1' },
    { name: 'diagram2', value: 'diagram2' },
  ];

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
        selectOptions: diagrams,
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
