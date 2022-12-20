import {
  isToggleSwitchEntryEdited, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

const extensionHelper = new ExtensionHelper('apex:ExecutePlsql');

export default function (element, injector) {
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
    },
  ];
}

function IsCallable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    var value = element.businessObject.isCallable;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        isCallable: 'false',
      });
    }

    return (element.businessObject.isCallable === 'true');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isCallable: value ? 'true' : 'false',
    });
  };

  const entry = new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Callable'),
    description: translate('Select if this diagram should be called in a Call Activity'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function IsStartable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    var value = element.businessObject.isStartable;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        isStartable: 'false',
      });
    }

    return (element.businessObject.isStartable === 'true');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isStartable: value ? 'true' : 'false',
    });
  };

  const entry = new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Startable'),
    description: translate('Select if this diagram is startable'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}