import {
  HeaderButton,
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  ListGroup,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { updateProperties } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import PageItemsList from '../lists/PageItemsList';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import { getApplications, getPages } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexPage');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexPage',
  'apex:PageItems',
  'pageItems',
  'apex:PageItem',
  'pageItem'
);

export default function (element, injector) {
  const [applications, setApplications] = useState([]);
  const [pages, setPages] = useState([]);

  return [
    {
      id: 'inputSelection',
      element,
      component: InputSelection,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'applicationId',
      element,
      hooks: {
        applications,
        setApplications,
        pages,
        setPages,
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
      id: 'pageId',
      element,
      hooks: {
        applications,
        setApplications,
        pages,
        setPages,
      },
      component: PageId,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'pageIdText',
      element,
      component: PageIdText,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'quickpick-items',
      element,
      component: QuickpickItems,
    },
    {
      id: 'pageItems',
      element,
      label: 'Page Items',
      component: ListGroup,
      ...PageItemsList({ element, injector }, listExtensionHelper),
    },
  ];
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
      updateProperties(
        {
          element,
          moddleElement: element.businessObject,
          properties: {
            manualInput: 'false',
          },
        },
        commandStack
      );
    }

    return element.businessObject.manualInput;
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      manualInput: value,
    });
  };

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Input'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Use APEX meta data'), value: 'false' },
        { label: translate('Manual input'), value: 'true' },
      ];
    },
  });
}

function ApplicationId(props) {
  const { element, id } = props;

  const { applications, setApplications, pages, setPages } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  useEffect(() => {
    getApplications().then(applications => setApplications(applications));
  }, [setApplications]);

  const getOptions = () => [
    ...applications.map((application) => {
      return {
        label: application.label,
        value: application.value,
      };
    }),
  ];

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      applicationId: value,
    });

    getPages(value).then(pages => setPages(pages));
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

function PageId(props) {
  const { element, id } = props;

  const { pages, setPages } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  // useEffect(() => {
  //   getPages().then(pages => setPages(pages));
  // }, [setPages]);

  const getOptions = () => [
    ...pages.map((page) => {
      return {
        label: page.label,
        value: page.value,
      };
    }),
  ];

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'pageId');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      pageId: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Page'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: getOptions,
  });
}

function PageIdText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'pageId');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      pageId: value,
    });

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Page ID'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function QuickpickItems(props) {
  const { element, id } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  return new HeaderButton({
    id: id,
    element: element,
    children: translate('Generate defaults'),
    onClick: function () {
      listExtensionHelper.addSubElement(
        { element, bpmnFactory, commandStack },
        {
          itemName: 'PROCESS_ID',
          itemValue: '&F4A$PROCESS_ID.',
        }
      );
      listExtensionHelper.addSubElement(
        { element, bpmnFactory, commandStack },
        {
          itemName: 'SUBFLOW_ID',
          itemValue: '&F4A$SUBFLOW_ID.',
        }
      );
      listExtensionHelper.addSubElement(
        { element, bpmnFactory, commandStack },
        {
          itemName: 'STEP_KEY',
          itemValue: '&F4A$STEP_KEY.',
        }
      );
    },
  });
}
