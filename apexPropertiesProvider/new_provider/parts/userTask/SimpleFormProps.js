import { 
  isSelectEntryEdited,
  isTextAreaEntryEdited, ListGroup, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import PageItemsList from '../pageItems/PageItemsList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry, DefaultTextFieldEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

import { getFormTemplates, getApplications, getPages, getItems } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexSimpleForm');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexSimpleForm',
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

  if (businessObject.type === 'apexSimpleForm') {

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
        cleanup: (value) => {
          return {
            ...(value === true && {formTemplate: null}),
            ...(value === false && {formTemplateId: null})
          };
        },
        cleanupHelper: extensionHelper
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
        label: 'Page Items',
        component: ListGroup,
        ...PageItemsList(
          {
            element,
            injector,
            helper: listExtensionHelper,
          }
        ),
      }
    );

    if (manualInput) {
      entries.push(
        {
          id: 'templateIdItem',
          element,
          label: translate('Item containing template ID'),
          helper: extensionHelper,
          property: 'templateIdItem',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
      );
    } else {
      entries.push(
        {
          id: 'formTemplateItem',
          element,
          property: 'formTemplateItem',
          label: translate('Item containing template ID'),
          component: ItemProp,
          isEdited: isSelectEntryEdited,
        }
      );
    }

    entries.push(
      {
        id: 'formTemplateId',
        element,
        component: FormTemplateProp,
        isEdited: isSelectEntryEdited,
      }
    );
  }
  return entries;
}

function FormTemplateProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [formTemplates, setFormTemplates] = useState({});

  useEffect(() => {
    getFormTemplates().then(ft => setFormTemplates({ values: ft, loaded: true }));
  }, []);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Form Template')}
    helper=${extensionHelper}
    property=formTemplateId
    state=${formTemplates}
  />`;
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

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');

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

  const {element, id, property, label} = props;

  const [items, setItems] = useState({});

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');
  const pageId = extensionHelper.getExtensionProperty(element, 'pageId');

  useEffect(() => {
    getItems(applicationId, pageId).then(i => setItems({ values: i, loaded: true, applicationId: applicationId, pageId: pageId }));
  }, [applicationId, pageId]);

  const needsRefresh = (applicationId !== items.applicationId) || (pageId !== items.pageId);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${label}
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