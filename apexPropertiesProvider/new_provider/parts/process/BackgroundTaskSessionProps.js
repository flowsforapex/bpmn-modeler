import {
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getApplications, getPages, getUsernames } from '../../plugins/metaDataCollector';

import { getBusinessObject } from '../../helper/util';

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const [values, setValues] = useState({});

  useEffect(() => {
    if (!values.applications) {
      getApplications().then(applications => setValues((existing) => { return {...existing, applications: applications}; }));
    }
    if (!values.usernames) {
      getUsernames().then(usernames => setValues((existing) => { return {...existing, usernames: usernames}; }));
    }
  }, [element.id]);

  const {applicationId} = businessObject;

  useEffect(() => {
    if (applicationId) {
      getPages(applicationId).then(pages => setValues((existing) => { return {...existing, pages: pages}; }));
    }
  }, [applicationId]);

  const {applications, usernames, pages} = values;

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
        label: translate('Default Application'),
        property: 'applicationId',
        state: applications,
        // asyncGetter: getApplications,
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
        // asyncGetter: getUsernames,
        component: DefaultSelectEntryAsync,
        isEdited: isSelectEntryEdited,
      },
    );
  }
  return entries;
}