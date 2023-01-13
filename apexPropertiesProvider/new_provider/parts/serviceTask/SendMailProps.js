import {
  isSelectEntryEdited,
  isTextAreaEntryEdited, isTextFieldEntryEdited, SelectEntry, TextAreaEntry, TextFieldEntry, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

import { OpenDialogLabel } from '../../helper/OpenDialogLabel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getApplications, getTemplates } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:SendMail');

export default function (args) {
  const [applications, setApplications] = useState([]);
  const [templates, setTemplates] = useState([]);

  const {element} = args;

  const entries = [];
  
  if (element.businessObject.type === 'sendMail') {
    
    const useTemplate = (extensionHelper.getExtensionProperty(element, 'useTemplate') === 'true');

    entries.push(
      {
        id: 'immediately',
        element,
        component: Immediately,
        // isEdited: isToggleSwitchEntryEdited,
      },
      {
        id: 'emailFrom',
        element,
        component: EmailFrom,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailTo',
        element,
        component: EmailTo,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailCC',
        element,
        component: EmailCC,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailBCC',
        element,
        component: EmailBCC,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'emailReplyTo',
        element,
        component: EmailReplyTo,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'useTemplate',
        element,
        component: UseTemplate,
        // isEdited: isToggleSwitchEntryEdited,
      },
    );

    if (useTemplate) {
      entries.push(
        {
          id: 'inputSelection',
          element,
          component: InputSelection,
          // isEdited: isToggleSwitchEntryEdited,
        },
        {
          id: 'applicationId',
          element,
          hooks: {
            applications,
            setApplications,
            templates,
            setTemplates,
          },
          component: ApplicationId,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'applicationIdText',
          element,
          component: ApplicationIdText,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'templateId',
          element,
          hooks: {
            applications,
            setApplications,
            templates,
            setTemplates,
          },
          component: TemplateId,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'templateIdText',
          element,
          component: TemplateIdText,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'placeholder',
          element,
          component: Placeholder,
          isEdited: isTextAreaEntryEdited,
        },
        {
          id: 'placeholderEditorContainer',
          element,
          component: PlaceholderEditorContainer,
        },
      );
    } else {
      entries.push(
        {
          id: 'subject',
          element,
          component: Subject,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'bodyText',
          element,
          component: BodyText,
          isEdited: isTextAreaEntryEdited,
        },
        {
          id: 'bodyTextEditorContainer',
          element,
          component: BodyTextEditorContainer,
        },
        {
          id: 'bodyHTML',
          element,
          component: BodyHTML,
          isEdited: isTextAreaEntryEdited,
        },
        {
          id: 'bodyHTMLEditorContainer',
          element,
          component: BodyHTMLEditorContainer,
        }
      );
    }
    
    entries.push(
      {
        id: 'attachment',
        element,
        component: Attachment,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'attachmentEditorContainer',
        element,
        component: AttachmentEditorContainer,
      },
    );
  }
  return entries;
}

function Immediately(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    var value = (extensionHelper.getExtensionProperty(element, 'immediately'));

    if (!value) {
      extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
        immediately: 'true',
      });
    }

    return (extensionHelper.getExtensionProperty(element, 'immediately') === 'true');
  };
    

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      immediately: value ? 'true' : 'false',
    });

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Send Email Immediately'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function EmailFrom(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'emailFrom');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      emailFrom: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('From'),
    description: translate('Email of the sender'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function EmailTo(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'emailTo');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      emailTo: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('To'),
    description: translate('Email of the recipient(s)'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function EmailCC(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'emailCC');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      emailCC: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('CC'),
    description: translate('Carbon copy recipient(s)'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function EmailBCC(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'emailBCC');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      emailBCC: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('BCC'),
    description: translate('Blind carbon copy recipient(s)'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function EmailReplyTo(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'emailReplyTo');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      subject: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Reply To'),
    description: translate('Email where the reply should be send to'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function UseTemplate(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    var value = (extensionHelper.getExtensionProperty(element, 'useTemplate'));

    if (!value) {
      extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
        useTemplate: 'false',
      });
    }

    return (extensionHelper.getExtensionProperty(element, 'useTemplate') === 'true');
  };

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      useTemplate: value ? 'true' : 'false',
    });

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Use Template'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function InputSelection(props) {
  const { element, id } = props;

  const translate = useService('translate');
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');

  const getValue = () => {
    var value = element.businessObject.manualInput;

    if (typeof value === 'undefined') {
      modeling.updateProperties(element, {
        manualInput: 'false',
      });
    }

    return element.businessObject.manualInput === 'false';
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      manualInput: value ? 'false' : 'true',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Use APEX meta data'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function ApplicationId(props) {
  const { element, id } = props;

  const { applications, setApplications, templates, setTemplates } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  useEffect(() => {
    getApplications().then(applications => setApplications(applications));
  }, [setApplications]);

  const getOptions = () => {
    const currValue = extensionHelper.getExtensionProperty(
      element,
      'applicationId'
    );

    const existing =
      currValue == null || applications.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...applications.map((application) => {
        return {
          label: application.label,
          value: application.value,
        };
      }),
    ];
  };

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      applicationId: value,
    });

    getTemplates(value).then(templates => setTemplates(templates));
  };

  if (element.businessObject.manualInput === 'false') {
    return new SelectEntry({
      id: id,
      element: element,
      label: translate('Application'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      getOptions: getOptions,
    });
  }
}

function ApplicationIdText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      applicationId: value,
    });
  };

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Application ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function TemplateId(props) {
  const { element, id } = props;

  const { templates, setTemplates } = props.hooks;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getOptions = () => {
    const currValue = extensionHelper.getExtensionProperty(element, 'templateId');

    const existing =
      currValue == null || templates.map(e => e.value).includes(currValue);

    return [
      ...(existing ? [] : [{ label: `${currValue}*`, value: currValue }]),
      ...templates.map((template) => {
        return {
          label: template.label,
          value: template.value,
        };
      }),
    ];
  };

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'templateId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      templateId: value,
    });
  };

  if (element.businessObject.manualInput === 'false') {
    return new SelectEntry({
      id: id,
      element: element,
      label: translate('Template'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
      getOptions: getOptions,
    });
  }
}

function TemplateIdText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'templateId');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      templateId: value,
    });
  };

  if (element.businessObject.manualInput === 'true') {
    return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Template ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce,
    });
  }
}

function Placeholder(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'placeholder');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      placeholder: value,
    });

  const label =
    OpenDialogLabel(translate('Placeholder'), () => {
      var getPlaceholder = function () {
        return extensionHelper.getExtensionProperty(element, 'placeholder');
      };
      var savePlaceholder = function (text) {
        extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
          placeholder: text,
        });
      };
      openEditor(
        'placeholder',
        getPlaceholder,
        savePlaceholder,
        'json',
        null
      );
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: label,
    description: translate('Provide values for email template'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function PlaceholderEditorContainer() {
  const translate = useService('translate');

  return getContainer('placeholder', translate);
}

function Subject(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'subject');

  const setValue = (value) => {
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      subject: value,
    });
  };

  return new TextFieldEntry({
    id: id,
    element: element,
    label: translate('Subject'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function BodyText(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'bodyText');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      bodyText: value,
    });

  const label =
    OpenDialogLabel(translate('Body Text'), () => {
      var getBodyText = function () {
        return extensionHelper.getExtensionProperty(element, 'bodyText');
      };
      var saveBodyText = function (text) {
        extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
          bodyText: text,
        });
      };
      openEditor(
        'bodyText',
        getBodyText,
        saveBodyText,
        'plaintext',
        null
      );
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: label,
    description: translate('Email content'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function BodyTextEditorContainer() {
  const translate = useService('translate');

  return getContainer('bodyText', translate);
}

function BodyHTML(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'bodyHTML');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      bodyHTML: value,
    });

  const label =
    OpenDialogLabel(translate('Body HTML'), () => {
      var getBodyHTML = function () {
        return extensionHelper.getExtensionProperty(element, 'bodyHTML');
      };
      var saveBodyHTML = function (text) {
        extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
          bodyHTML: text,
        });
      };
      openEditor(
        'bodyHTML',
        getBodyHTML,
        saveBodyHTML,
        'html',
        null
      );
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: label,
    description: translate('HTML version of the email'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function BodyHTMLEditorContainer() {
  const translate = useService('translate');

  return getContainer('bodyHTML', translate);
}

function Attachment(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'attachment');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      attachment: value,
    });

  const label =
    OpenDialogLabel(translate('Attachment'), () => {
      var getAttachment = function () {
        return extensionHelper.getExtensionProperty(element, 'attachment');
      };
      var saveAttachment = function (text) {
        extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
          attachment: text,
        });
      };
      openEditor(
        'attachment',
        getAttachment,
        saveAttachment,
        'sql',
        null
      );
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: label,
    description: translate('SQL query to get attachment'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function AttachmentEditorContainer() {
  const translate = useService('translate');

  return getContainer('attachment', translate);
}