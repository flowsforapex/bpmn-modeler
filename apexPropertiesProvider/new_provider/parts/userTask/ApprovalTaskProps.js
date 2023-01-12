import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, ListGroup, SelectEntry,
  TextFieldEntry, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ParametersList from '../parameters/ParametersList';

import { Quickpick } from '../../helper/Quickpick';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getApplications, getTasks
} from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexApproval');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexApproval',
  'apex:Parameters',
  'parameters',
  'apex:Parameter',
  'parameter'
);

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [tasks, setTasks] = useState([]);

  const {element, injector} = args;

  if (element.businessObject.type === 'apexApproval') {
    return [
      {
        id: 'inputSelection',
        element,
        component: InputSelection,
        // isEdited: isToggleSwitchEntryEdited,
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
      {
        id: 'subject',
        element,
        component: Subject,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'businessRef',
        element,
        component: BusinessRef,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'parameters',
        element,
        label: 'Parameters',
        component: ListGroup,
        ...ParametersList({ element, injector }, listExtensionHelper, {}),
      },
      {
        id: 'resultVariable',
        element,
        component: ResultVariable,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'initiator',
        element,
        component: Initiator,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'priority',
        element,
        component: Priority,
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

function Subject(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'subject');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      subject: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Subject'),
    description: translate('Overwrite default value set in task definition'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function BusinessRef(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'businessRef');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      businessRef: value,
    });
  };

  return [
    new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Business Reference'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    }),
    Quickpick(
      {
        text: 'business_ref',
        handler: () => {
          extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            businessRef: '&F4A$BUSINESS_REF.',
          });
        }
      })
  ];
}

function ResultVariable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'resultVariable');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      resultVariable: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Result Variable'),
    description: translate('Name of the variable to return the approval result into'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function Initiator(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'initiator');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      initiator: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Initiator'),
    description: translate('Initiator of this approval task'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function Priority(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'priority');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      priority: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Priority'),
    description: translate('Overwrite default value set in task definition'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}