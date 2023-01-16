import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, SelectEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

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

function CalledDiagramVersionSelection(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    var value = element.businessObject.calledDiagramVersionSelection;

    if (!value) {
      modeling.updateProperties(element, {
        calledDiagramVersionSelection: 'latestVersion',
      });
    }

    return element.businessObject.calledDiagramVersionSelection;
  };

  const setValue = (value) => {
    const update = {
      calledDiagramVersionSelection: value,
      ...(value === 'latestVersion' && {calledDiagramVersion: null}) // TODO add as action to template ?
    };

    modeling.updateProperties(element, update);
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Versioning'),
    description: translate('Used diagram version'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Latest version'), value: 'latestVersion' },
        { label: translate('Named version'), value: 'namedVersion' },
      ];
    },
  });
}