import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, ListGroup
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

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

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  if (!['apexApproval'].includes(businessObject.type)) {

    const [values, setValues] = useState({});

    useEffect(() => {
      if (!values.applications) {
        getApplications().then(applications => setValues((existing) => { return {...existing, applications: applications}; }));
      }
    }, [element.id]);

    const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');

    useEffect(() => {
      if (applicationId) {
        getPages(applicationId).then(pages => setValues((existing) => { return {...existing, pages: pages}; }));
      }
    }, [applicationId]);

    const pageId = extensionHelper.getExtensionProperty(element, 'pageId');

    useEffect(() => {
      if (applicationId && pageId) {
        getItems(applicationId, pageId).then(items => setValues((existing) => { return {...existing, items: items}; }));
      }
    }, [applicationId, pageId]);

    const {applications, pages, items} = values;

    const manualInput = businessObject.manualInput === 'true';

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
          id: 'applicationIdText',
          element,
          label: translate('Application ID'),
          helper: extensionHelper,
          property: 'applicationId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'pageIdText',
          element,
          label: translate('Page ID'),
          helper: extensionHelper,
          property: 'pageId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
      );
    } else {
      entries.push(
        {
          id: 'applicationId',
          element,
          label: translate('Application'),
          helper: extensionHelper,
          property: 'applicationId',
          state: applications,
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'pageId',
          element,
          label: translate('Page'),
          helper: extensionHelper,
          property: 'pageId',
          state: pages,
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
      );
    }
    
    entries.push(
      {
        element,
        component: QuickpickItems,
      },
      {
        id: 'pageItems',
        element,
        label: 'Page Items',
        component: ListGroup,
        ...PageItemsList(
          {
            element,
            injector,
            helper: listExtensionHelper,
            state: items,
          }
        ),
      }
    );

    entries.push(
        {
          id: 'request',
          element,
          label: translate('Request'),
          description: translate('Request Value for Page Call'),
          helper: extensionHelper,
          property: 'request',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'cache',
          element,
          label: translate('Clear Cache'),
          description: translate('Clear Cache Value for Page Call'),
          helper: extensionHelper,
          property: 'cache',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
      );
  }
  return entries;
}

function QuickpickItems(props) {
  const { element } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  return Quickpick(
    {
      text: translate('Generate default items'),
      handler: () => {
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'PROCESS_ID',
            itemValue: '&F4A$PROCESS_ID.',
          }
        });
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'SUBFLOW_ID',
            itemValue: '&F4A$SUBFLOW_ID.',
          }
        });
        listExtensionHelper.addSubElement({
          element,
          modeling,
          bpmnFactory,
          newProps: {
            itemName: 'STEP_KEY',
            itemValue: '&F4A$STEP_KEY.',
          }
        });
      }
    }
  );
}
