import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import { getBusinessObject } from '../../helper/util';
import {
  getApplications, getPages, getUsernames
} from '../../plugins/metaDataCollector';

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [pages, setPages] = useState([]);
  const [usernames, setUsernames] = useState([]);
  
  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  const manualInput = businessObject.manualInput === 'true';

  const {applicationId} = businessObject;

  useEffect(() => {
    getApplications().then(applications => setApplications(applications));
  }, []);

  useEffect(() => {
    getPages(applicationId).then(pages => setPages(pages));
  }, [applicationId]);

  useEffect(() => {
    getUsernames().then(usernames => setUsernames(usernames));
  }, []);

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
        label: translate('Default Application'),
        property: 'applicationId',
        state: applications,
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'pageId',
        element,
        label: translate('Default Page'),
        property: 'pageId',
        state: pages,
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'username',
        element,
        label: translate('Default Username'),
        property: 'username',
        state: usernames,
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      },
    );
  }
  return entries;
}