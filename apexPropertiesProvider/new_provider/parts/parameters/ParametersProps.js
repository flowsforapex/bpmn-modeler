import {
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

export default function ParameterProps(props) {
  const { idPrefix, parameter, hooks } = props;

  return [
    {
      id: `${idPrefix}-parStaticId`,
      component: ParStaticId,
      idPrefix,
      parameter,
      hooks,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-parDataType`,
      component: ParDataType,
      idPrefix,
      parameter,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-parValue`,
      component: ParValue,
      idPrefix,
      parameter,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function ParStaticId(props) {
  const { idPrefix, element, parameter } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      parStaticId: value,
    });
  };

  const getValue = parameter => parameter.parStaticId;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-parStaticId`,
    label: translate('Static ID'),
    getValue,
    setValue,
    debounce,
  });
}

function ParDataType(props) {
  const { idPrefix, element, parameter } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      parDataType: value,
    });
  };

  const getValue = parameter => parameter.parDataType;

  return SelectEntry({
    element: parameter,
    id: `${idPrefix}-parDataType`,
    label: translate('Data Type'),
    getValue,
    setValue,
    debounce,
    getOptions: () => [
      { label: translate('String'), value: 'String' }
    ]
  });
}

function ParValue(props) {
  const { idPrefix, element, parameter } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, parameter, {
      parValue: value,
    });
  };

  const getValue = parameter => parameter.parValue;

  return TextFieldEntry({
    element: parameter,
    id: `${idPrefix}-parValue`,
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
  });
}
