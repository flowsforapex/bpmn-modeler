import {
  isSelectEntryEdited,
  isTextAreaEntryEdited, isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getApplicationsMail, getJSONPlaceholders, getTemplates } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:SendMail');

export default function (args) {
  
  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];
  
  if (businessObject.type === 'sendMail') {

    const [values, setValues] = useState({});

    useEffect(() => {
      if (!values.applicationsMail) {
        getApplicationsMail().then(applicationsMail => setValues((existing) => {
          return {...existing, applicationsMail: applicationsMail};
        }));
      }
    }, [element.id]);

    const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');

    useEffect(() => {
      if (applicationId) {
        getTemplates(applicationId).then(templates => setValues((existing) => { return {...existing, templates: templates}; }));
      }
    }, [applicationId]);
    
    const {applicationsMail, templates} = values;
    
    const manualInput = businessObject.manualInput === 'true';
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
        cleanup: (value) => {
          return {
                  ...(value === true && {subject: null, bodyText: null, bodyHTML: null}),
                  ...(value === false && {applicationId: null, templateId: null, placeholder: null})
                }; 
          },
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
        entries.push(
          {
            id: 'applicationId',
            element,
            label: translate('Application'),
            helper: extensionHelper,
            property: 'applicationId',
            state: applicationsMail,
            component: DefaultSelectEntryAsync,
            isEdited: isSelectEntryEdited,
          },
          {
            id: 'templateId',
            element,
            label: translate('Template'),
            helper: extensionHelper,
            property: 'templateId',
            state: templates,
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
        {
          element,
          component: QuickpickPlaceholder,
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

function QuickpickPlaceholder(props) {
  const { element } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');
  const templateId = extensionHelper.getExtensionProperty(element, 'templateId');

  return Quickpick(
    {
      text: translate('Load JSON'),
      handler: () => {
        getJSONPlaceholders(applicationId, templateId)
        .then((placeholder) => {
          extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            placeholder: JSON.stringify(placeholder, null, 1)
          });
        });
      }
    }
  );
}