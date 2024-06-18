import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import { DefaultSelectEntry, DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

import { getDiagrams } from '../../plugins/metaDataCollector';

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  const versionSelectionOptions = [
    { label: translate('Latest version'), value: 'latestVersion' },
    { label: translate('Named version'), value: 'namedVersion' },
  ];

  const manualInput = businessObject.manualInput === 'true';
  const versionSelection = businessObject.calledDiagramVersionSelection;

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
    entries.push(
      {
        id: 'calledDiagram',
        element,
        component: CalledDiagramProp,
        isEdited: isSelectEntryEdited,
      }
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

  if (versionSelection === 'namedVersion') {
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

function CalledDiagramProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [diagrams, setDiagrams] = useState({});

  useEffect(() => {
    getDiagrams().then(d => setDiagrams({ values: d, loaded: true }));
  }, []);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Called Diagram')}
    description=${translate('Name of the diagram')}
    property=calledDiagram
    state=${diagrams}
  />`;
}