import {
  isSelectEntryEdited,
  isTextAreaEntryEdited, isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getApplications, getTemplates } from '../../plugins/metaDataCollector';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

const extensionHelper = new ExtensionHelper('apex:SendMail');

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [templates, setTemplates] = useState([]);

  const {element, injector} = args;

  const translate = injector.get('translate');

  const entries = [];
  
  if (element.businessObject.type === 'sendMail') {
    
    const manualInput = element.businessObject.manualInput === 'true';
    const useTemplate = (extensionHelper.getExtensionProperty(element, 'useTemplate') === 'true');

    entries.push(
      {
        id: 'immediately',
        element,
        label: translate('Send Email Immediately'),
        helper: extensionHelper,
        property: 'immediately',
        defaultValue: 'true',
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'emailFrom',
        element,
        label: translate('From'),
        description: translate('Email of the sender'),
        helper: extensionHelper,
        property: 'emailFrom',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailTo',
        element,
        label: translate('To'),
        description: translate('Email of the recipient(s)'),
        helper: extensionHelper,
        property: 'emailTo',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailCC',
        element,
        label: translate('CC'),
        description: translate('Carbon copy recipient(s)'),
        helper: extensionHelper,
        property: 'emailCC',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailBCC',
        element,
        label: translate('BCC'),
        description: translate('Blind carbon copy recipient(s)'),
        helper: extensionHelper,
        property: 'emailBCC',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailReplyTo',
        element,
        label: translate('Reply To'),
        description: translate('Email where the reply should be send to'),
        helper: extensionHelper,
        property: 'emailReplyTo',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'useTemplate',
        element,
        label: translate('Use Template'),
        helper: extensionHelper,
        property: 'useTemplate',
        defaultValue: 'false',
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      },
    );

    if (useTemplate) {
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
            id: 'templateIdText',
            element,
            label: translate('Template ID'),
            helper: extensionHelper,
            property: 'templateId',
            component: DefaultTextFieldEntry,
            isEdited: isTextFieldEntryEdited,
          }
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
            
                return getTemplates(applicationId);
              },
              nextSetter: setTemplates,
            },
            component: DefaultSelectEntryAsync,
            isEdited: isSelectEntryEdited,
          },
          {
            id: 'templateId',
            element,
            label: translate('Template'),
            helper: extensionHelper,
            property: 'templateId',
            hooks: {
              state: templates,
            },
            component: DefaultSelectEntryAsync,
            isEdited: isSelectEntryEdited,
          }
        );
      }
        
      entries.push(
        {
          id: 'placeholder',
          element,
          label: translate('Placeholder'),
          description: translate('Provide values for email template'),
          helper: extensionHelper,
          property: 'placeholder',
          language: 'json',
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
    } else {
      entries.push(
        {
          id: 'subject',
          element,
          label: translate('Subject'),
          helper: extensionHelper,
          property: 'subject',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'bodyText',
          element,
          label: translate('Body Text'),
          description: translate('Email content'),
          helper: extensionHelper,
          property: 'bodyText',
          language: 'plaintext',
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
        {
          id: 'bodyHTML',
          element,
          label: translate('Body HTML'),
          description: translate('HTML version of the email'),
          helper: extensionHelper,
          property: 'bodyHTML',
          language: 'html',
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        }
      );
    }
    
    entries.push(
      {
        id: 'attachment',
        element,
        label: translate('Attachment'),
        description: translate('SQL query to get attachment'),
        helper: extensionHelper,
        property: 'attachment',
        language: 'sql',
        component: DefaultTextAreaEntryWithEditor,
        isEdited: isTextAreaEntryEdited,
      }
    );
  }
  return entries;
}