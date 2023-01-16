import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, ListGroup
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

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
  const [applications, setApplications] = useState([]);
  const [pages, setPages] = useState([]);
  const [items, setItems] = useState([]);

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];

  if (element.businessObject.type === 'apexPage' || typeof element.businessObject.type === 'undefined') {

    const manualInput = element.businessObject.manualInput === 'true';

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
      useEffect(() => {
        getApplications().then(applications => setApplications(applications));
      }, [setApplications]);

      entries.push(
        {
          id: 'applicationId',
          element,
          label: translate('Application'),
          helper: extensionHelper,
          property: 'applicationId',
          hooks: {
            state: applications,
            nextGetter: () => {
              const applicationId = extensionHelper.getExtensionProperty(
                element,
                'applicationId'
              );
          
              return getPages(applicationId);
            },
            nextSetter: setPages,
          },
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'pageId',
          element,
          label: translate('Page'),
          helper: extensionHelper,
          property: 'pageId',
          hooks: {
            state: pages,
            nextGetter: () => {
              const applicationId = extensionHelper.getExtensionProperty(
                element,
                'applicationId'
              );
              const pageId = extensionHelper.getExtensionProperty(
                element,
                'pageId'
              );
          
              return getItems(applicationId, pageId);
            },
            nextSetter: setItems,
          },
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
      );
    }
    
    entries.push(
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
      }
    );
  }
  return entries;
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
