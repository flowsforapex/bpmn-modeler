import {
  isToggleSwitchEntryEdited, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element) {
  return [
    {
      id: 'isCallable',
      element,
      component: IsCallable,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'isStartable',
      element,
      component: IsStartable,
      isEdited: isToggleSwitchEntryEdited,
    }
  ];
}

function IsCallable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => 
    // TODO default value not working in APEX atm
    
    // var value = element.businessObject.isCallable;

    // if (typeof value === 'undefined') {
    //   modeling.updateProperties(element, {
    //     isCallable: 'false',
    //   });
    // }

     (element.businessObject.isCallable === 'true')
  ;

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isCallable: value ? 'true' : 'false',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Callable'),
    description: translate('Select if this diagram should be called in a Call Activity'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function IsStartable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => 
    // TODO default value not working in APEX atm
    
    // var value = element.businessObject.isStartable;

    // if (typeof value === 'undefined') {
    //   modeling.updateProperties(element, {
    //     isStartable: 'false',
    //   });
    // }

     (element.businessObject.isStartable === 'true')
  ;

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isStartable: value ? 'true' : 'false',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Startable'),
    description: translate('Select if this diagram is startable'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}