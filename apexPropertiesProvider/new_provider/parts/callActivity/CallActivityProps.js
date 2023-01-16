import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultSelectEntry, DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getDiagrams
} from '../../plugins/metaDataCollector';

export default function (args) {
  const [diagrams, setDiagrams] = useState([]);

  const {element, injector} = args;

  const translate = injector.get('translate');

  const versionSelectionOptions = [
    { label: translate('Latest version'), value: 'latestVersion' },
    { label: translate('Named version'), value: 'namedVersion' },
  ];

  const entries = [];

  const manualInput = element.businessObject.manualInput === 'true';
  const selection = element.businessObject.calledDiagramVersionSelection;

  entries.push(
    {
      id: 'inputSelection',
      element,
      label: translate('Use APEX meta data'),
      property: 'manualInput',
      defaultValue: 'false',
      invert: true,
      component: DefaultToggleSwitchEntry,
      // isEdited: isToggleSwitchEntryEdited,
    }
  );

  if (manualInput) {
    entries.push(
      {
        id: 'calledDiagramText',
        element,
        label: translate('Called Diagram'),
        description: translate('Name of the diagram'),
        property: 'calledDiagram',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  } else {
    useEffect(() => {
      getDiagrams().then(diagrams => setDiagrams(diagrams));
    }, [setDiagrams]);

    entries.push(
      {
        id: 'calledDiagram',
        element,
        label: translate('Called Diagram'),
        description: translate('Name of the diagram'),
        property: 'calledDiagram',
        hooks: {
          state: diagrams,
        },
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      },
    );
  }

  entries.push(
    {
      id: 'calledDiagramVersionSelection',
      element,
      label: translate('Versioning'),
      description: translate('Used diagram version'),
      property: 'calledDiagramVersionSelection',
      defaultValue: 'latestVersion',
      options: versionSelectionOptions,
      cleanup: (value) => {
        return {
                ...(value === 'latestVersion' && {calledDiagramVersion: null})
              }; 
        },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (selection === 'namedVersion') {
    entries.push(
      {
        id: 'calledDiagramVersion',
        element,
        label: translate('Version Name'),
        property: 'calledDiagramVersion',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
    );
  }

  return entries;
}