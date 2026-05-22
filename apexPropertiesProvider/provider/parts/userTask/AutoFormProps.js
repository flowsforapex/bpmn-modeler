import { CollapsibleEntry, isSelectEntryEdited, isTextFieldEntryEdited, isToggleSwitchEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntry, DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

// eslint-disable-next-line import/no-extraneous-dependencies
import { html } from 'htm/preact';

import { getApplications, getItems, getPages } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexAutoForm');

const listExtensionHelper = new ListExtensionHelper(
  {
    listParentType: 'apex:ApexAutoForm',
    listType: 'apex:PageItems',
    entryType: 'apex:PageItem',
    listAttr: 'pageItems',
    entryAttr: 'pageItem',
    entryName: null
  }
);

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  if (businessObject.type === 'apexAutoForm') {

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
          component: ApplicationProp,
          isEdited: isSelectEntryEdited
        },
        {
          id: 'pageId',
          element,
          component: PageProp,
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
        label: translate('Page Items'),
        component: PageItemsList,
        helper: extensionHelper,
        listHelper: listExtensionHelper,
      }
    );

    entries.push(
      {
        id: 'outputAsObject',
        element,
        label: translate('Store Output as JSON Object'),
        helper: extensionHelper,
        property: 'outputAsObject',
        component: DefaultToggleSwitchEntry,
        isEdited: isToggleSwitchEntryEdited,
      }
    );

    const outputAsObject = extensionHelper.getProperty({element, property: 'outputAsObject'}) === 'true';

    if (outputAsObject) {
      entries.push(
        {
          id: 'outputObjectVariable',
          element,
          label: translate('Process Variable Name'),
          helper: extensionHelper,
          property: 'outputObjectVariable',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'outputObjectTable',
          element,
          label: translate('Table Settings'),
          helper: extensionHelper,
          component: TableProps,
          prefix: 'outputObject',
        },
      );
    }

    entries.push(
      {
        id: 'outputAsValues',
        element,
        label: translate('Store Output as JSON Values'),
        helper: extensionHelper,
        property: 'outputAsValues',
        component: DefaultToggleSwitchEntry,
        isEdited: isToggleSwitchEntryEdited,
      }
    );

    const outputAsValues = extensionHelper.getProperty({element, property: 'outputAsValues'}) === 'true';

    if (outputAsValues) {
      entries.push(
        // {
        //   id: 'outputValuesVariable',
        //   element,
        //   label: translate('Process Variable Name'),
        //   helper: extensionHelper,
        //   property: 'outputValuesVariable',
        //   component: DefaultTextFieldEntry,
        //   isEdited: isTextFieldEntryEdited,
        // },
        {
          id: 'outputValuesTable',
          element,
          label: translate('Table Settings'),
          helper: extensionHelper,
          component: TableProps,
          prefix: 'outputValues',
        },
      );
    }
  }
  return entries;
}

function ApplicationProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [applications, setApplications] = useState({});

  useEffect(() => {
    getApplications().then(a => setApplications({ values: a, loaded: true }));
  }, []);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Application')}
    helper=${extensionHelper}
    property=applicationId
    state=${applications}
  />`;
}

function PageProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [pages, setPages] = useState({});

  const applicationId = extensionHelper.getProperty({element, property: 'applicationId'});

  useEffect(() => {
    getPages(applicationId).then(p => setPages({ values: p, loaded: true, applicationId: applicationId }));
  }, [applicationId]);

  const needsRefresh = applicationId !== pages.applicationId;

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Page')}
    helper=${extensionHelper}
    property=pageId
    state=${pages}
    needsRefresh=${needsRefresh}
  />`;
}

function ItemProp(props) {

  const {element, id, property, label, description} = props;

  const [items, setItems] = useState({});

  const applicationId = extensionHelper.getProperty({element, property: 'applicationId'});
  const pageId = extensionHelper.getProperty({element, property: 'pageId'});

  useEffect(() => {
    getItems(applicationId, pageId).then(i => setItems({ values: i, loaded: true, applicationId: applicationId, pageId: pageId }));
  }, [applicationId, pageId]);

  const needsRefresh = (applicationId !== items.applicationId) || (pageId !== items.pageId);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${label}
    description=${description}
    helper=${extensionHelper}
    property=${property}
    state=${items}
    needsRefresh=${needsRefresh}
  />`;
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

function TableProps(props) {

  const {element, id, helper, label, prefix} = props;

  const translate = useService('translate')

  const entries = [];

  const operationTypes = [
    { label: '', value: null },
    { label: translate('Insert Row'), value: 'insertRow' },
    { label: translate('Update Row'), value: 'updateRow' },
  ];

  entries.push(
    {
      id: `${prefix}TableName`,
      element,
      label: translate('Table Name'),
      helper: helper,
      property: `${prefix}TableName`,
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${prefix}OperationType`,
      element,
      label: translate('Operation Type'),
      helper: helper,
      property: `${prefix}OperationType`,
      options: operationTypes,
      // cleanup: (value) => {
      //   return {
      //     ...(!value && {expression: null}),
      //   };
      // },
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${prefix}PkName`,
      element,
      label: translate('Primary Key Name'),
      helper: helper,
      property: `${prefix}PkName`,
      component: DefaultTextFieldEntry,
      isEdited: isTextFieldEntryEdited,
    },
  );

  if (prefix === 'outputObject') {
    entries.push(
      {
        id: `${prefix}ColumnName`,
        element,
        label: translate('Column Name'),
        helper: helper,
        property: `${prefix}ColumnName`,
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  }
  
  return new CollapsibleEntry({
    id: id,
    element: element,
    label: label,
    entries: entries,
  });
}