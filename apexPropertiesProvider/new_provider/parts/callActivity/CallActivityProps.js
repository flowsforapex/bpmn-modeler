import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, isToggleSwitchEntryEdited, SelectEntry,
  TextFieldEntry, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';


import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getDiagrams
} from '../../plugins/metaDataCollector';

export default function (args) {
  const [diagrams, setDiagrams] = useState([]);

  const {element} = args;

  return [
    {
      id: 'inputSelection',
      element,
      component: InputSelection,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'calledDiagram',
      element,
      hooks: {
        diagrams,
        setDiagrams,
      },
      component: CalledDiagram,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'calledDiagramText',
      element,
      component: CalledDiagramText,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'calledDiagramVersionSelection',
      element,
      component: CalledDiagramVersionSelection,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'calledDiagramVersion',
      element,
      component: CalledDiagramVersion,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function InputSelection(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    var value = element.businessObject.manualInput;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        manualInput: 'false',
      });
    }

    return element.businessObject.manualInput === 'false';
  };

  const setValue = value =>
    modeling.updateProperties(element, {
      manualInput: value ? 'false' : 'true',
    });

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Use APEX meta data'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function CalledDiagram(props) {
  const { element, id } = props;

  const { diagrams, setDiagrams } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  useEffect(() => {
    getDiagrams().then(diagrams => setDiagrams(diagrams));
  }, [setDiagrams]);

  const getOptions = () => {
    const currValue = element.businessObject.calledDiagram;

    const existing =
      currValue == null || diagrams.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...diagrams.map((diagram) => {
        return {
          label: diagram.label,
          value: diagram.value,
        };
      }),
    ];
  };

  const getValue = () =>
    element.businessObject.calledDiagram;

  const setValue = value =>
    modeling.updateProperties(element, {
      calledDiagram: value,
    });

  if (element.businessObject.manualInput === 'false') {
    return new SelectEntry({
      id: id,
      element: element,
      label: translate('Called Diagram'),
      description: translate('Name of the diagram'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      getOptions: getOptions,
    });
  }
}

function CalledDiagramText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () =>
    element.businessObject.calledDiagram;

  const setValue = value =>
    modeling.updateProperties(element, {
      calledDiagram: value,
    });

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Called Diagram'),
      description: translate('Name of the diagram'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
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
      ...(value === 'latestVersion' && {calledDiagramVersion: null})
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

function CalledDiagramVersion(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () =>
    element.businessObject.calledDiagramVersion;

  const setValue = value =>
    modeling.updateProperties(element, {
      calledDiagramVersion: value,
    });

  const selection = element.businessObject.calledDiagramVersionSelection;

  if (selection === 'namedVersion') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Version Name'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}