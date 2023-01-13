import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, ListGroup,
  SelectEntry,
  TextFieldEntry,
  ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getApplications,
  getItems,
  getPages
} from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexPage');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexPage',
  'apex:PageItems',
  'pageItems',
  'apex:PageItem',
  'pageItem'
);

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [pages, setPages] = useState([]);
  const [items, setItems] = useState([]);

  const {element, injector} = args;

  if (element.businessObject.type === 'apexPage' || typeof element.businessObject.type === 'undefined') {
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
          pages,
          setPages,
          items,
          setItems,
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
          items,
          setItems,
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
        ...PageItemsList({ element, injector }, listExtensionHelper, {
          items,
          setItems,
        }),
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

  const { applications, setApplications, pages, setPages } = props.hooks;

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

  const { pages, setPages, items, setItems } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getOptions = () => {
    const currValue = extensionHelper.getExtensionProperty(element, 'pageId');

    const existing =
      currValue == null || pages.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...pages.map((page) => {
        return {
          label: page.label,
          value: page.value,
        };
      }),
    ];
  };

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'pageId');

  const setValue = (value) => {
    const applicationId = extensionHelper.getExtensionProperty(
      element,
      'applicationId'
    );

    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      pageId: value,
    });

    getItems(applicationId, value).then(items => setItems(items));
  };

  if (element.businessObject.manualInput === 'false') {
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

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Page ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function QuickpickItems(props) {
  const { element, id } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  return Quickpick(
    {
      text: translate('Generate default items'),
      handler: () => {
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
      }
    }
  );
}
