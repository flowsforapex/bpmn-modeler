import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, isToggleSwitchEntryEdited, SelectEntry,
  TextFieldEntry, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';


import ExtensionHelper from '../../helper/ExtensionHelper';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getApplications
} from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexApproval');

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [tasks, setTasks] = useState([]);

  const {element} = args;

  if (element.businessObject.type === 'apexApproval') {
    return [
      {
        id: 'inputSelection',
        element,
        component: InputSelection,
        isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'applicationId',
        element,
        hooks: {
          applications,
          setApplications,
          tasks,
          setTasks,
        },
        component: ApplicationId,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'applicationIdText',
        element,
        component: ApplicationIdText,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'taskStaticId',
        element,
        hooks: {
          applications,
          setApplications,
          tasks,
          setTasks,
        },
        component: TaskStaticId,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'taskStaticIdText',
        element,
        component: TaskStaticIdText,
        isEdited: isTextFieldEntryEdited,
      },
    ];
  }
  return [];
}

function InputSelection(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');

  const getValue = () => {
    var value = element.businessObject.manualInput;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        manualInput: 'false',
      });
    }

    return element.businessObject.manualInput === 'false';
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      manualInput: value ? 'false' : 'true',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Use APEX meta data'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function ApplicationId(props) {
  const { element, id } = props;

  const { applications, setApplications, tasks, setTasks } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  useEffect(() => {
    getApplications().then(applications => setApplications(applications));
  }, [setApplications]);

  const getOptions = () => {
    const currValue = extensionHelper.getExtensionProperty(
      element,
      'applicationId'
    );

    const existing =
      currValue == null || applications.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...applications.map((application) => {
        return {
          label: application.label,
          value: application.value,
        };
      }),
    ];
  };

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      applicationId: value,
    });

    getTasks(value).then(tasks => setTasks(tasks));
  };

  if (element.businessObject.manualInput === 'false') {
    return new SelectEntry({
      id: id,
      element: element,
      label: translate('Application'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      getOptions: getOptions,
    });
  }
}

function ApplicationIdText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      applicationId: value,
    });
  };

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Application ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function TaskStaticId(props) {
  const { element, id } = props;

  const { tasks, setTasks } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getOptions = () => {
    const currValue = extensionHelper.getExtensionProperty(element, 'taskStaticId');

    const existing =
      currValue == null || tasks.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...tasks.map((task) => {
        return {
          label: task.label,
          value: task.value,
        };
      }),
    ];
  };

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'taskStaticId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      taskStaticId: value,
    });
  };

  if (element.businessObject.manualInput === 'false') {
    return new SelectEntry({
      id: id,
      element: element,
      label: translate('Task Definition'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      getOptions: getOptions,
    });
  }
}

function TaskStaticIdText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'taskStaticId');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      taskStaticId: value,
    });

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Task Definition Static ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}