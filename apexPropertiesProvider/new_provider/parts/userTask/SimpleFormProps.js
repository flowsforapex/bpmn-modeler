import { isSelectEntryEdited, isTextAreaEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry, DefaultTextFieldEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

import { getFormTemplates, getApplications, getPages, getItems } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexSimpleForm');

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
        {
          id: 'itemNameText',
          element,
          label: translate('Item Name'),
          helper: extensionHelper,
          property: 'itemName',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'formTemplate',
          element,
          label: translate('Form Template'),
          helper: extensionHelper,
          property: 'formTemplate',
          language: 'json',
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
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
        {
          id: 'itemName',
          element,
          component: ItemNameProp,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'formTemplateId',
          element,
          component: FormTemplateProp,
          isEdited: isSelectEntryEdited,
        },
      );
    }
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

function ItemNameProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

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
    label=${translate('Item')}
    helper=${extensionHelper}
    property=itemName
    state=${items}
    needsRefresh=${needsRefresh}
  />`;
}