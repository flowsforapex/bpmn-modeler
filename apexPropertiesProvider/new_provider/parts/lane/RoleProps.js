import { isTextFieldEntryEdited, isToggleSwitchEntryEdited, TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (args) {

  const {element} = args;
  
  return [
    {
      id: 'isRole',
      element,
      component: IsRole,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'role',
      element,
      component: Role,
      isEdited: isTextFieldEntryEdited,
    },
  ];
}

function IsRole(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    var value = element.businessObject.isRole;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        isRole: 'false',
      });
    }

    return (element.businessObject.isRole === 'true');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isRole: value ? 'true' : 'false',
    });
  };

  const entry = new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Role'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function Role(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => element.businessObject.role;

  const setValue = (value) => {
    modeling.updateProperties(element, {
      role: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Role'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}