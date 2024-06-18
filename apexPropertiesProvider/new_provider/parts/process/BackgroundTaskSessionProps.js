import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

var pagesLoaded = false;

import { getApplications, getPages, getUsernames } from '../../plugins/metaDataCollector';

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

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
        label: translate('Default Application ID'),
        property: 'applicationId',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'pageIdText',
        element,
        label: translate('Default Page ID'),
        property: 'pageId',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'usernameText',
        element,
        label: translate('Default Username'),
        property: 'username',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      }
    );
  } else {
    entries.push(
      {
        id: 'applicationId',
        element,
        component: ApplicationProp,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'pageId',
        element,
        component: PageProp,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'username',
        element,
        component: UsernameProp,
        isEdited: isSelectEntryEdited,
      },
    );
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
    label=${translate('Default Application')}
    property=applicationId
    state=${applications}
  />`;
}

function PageProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const [pages, setPages] = useState({ loaded: false });

  const {applicationId} = businessObject;
  
  useEffect(() => {
    getPages(applicationId).then(p => setPages({ values: p, loaded: true, applicationId: applicationId }));
  }, [applicationId]);
  
  const needsRefresh = applicationId !== pages.applicationId;
  
  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Default Page')}
    property=pageId
    state=${pages}
    needsRefresh=${needsRefresh}
  />`;
}

function UsernameProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    getUsernames().then(u => setUsernames({ values: u, loaded: true }));
  }, []);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Default Username')}
    property=username
    state=${usernames}
  />`;
}