import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../helper/propertiesHelper';
import {
  getApplicationsMail,
  getTemplates,
  getWorkspaces
} from '../../plugins/metaDataCollector';
import { getContainer, openEditor } from '../../plugins/monacoEditor';

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var domQuery = require('min-dom').query;

var helper = new propertiesHelper('apex:SendMail');

// element identifier for current element
var elementIdentifier;

// select list options container
var workspaces = [];
var applications = [];
var templates = [];

// select box container
var workspaceSelectBox;
var applicationSelectBox;
var templateSelectBox;

// loading flags
var workspacesLoading;
var applicationsLoading;
var templatesLoading;

function enableAndResetValue(element, field, property) {
  // get dom node
  var fieldNode = domQuery(`select[name="${field.id}"]`);
  if (fieldNode) {
    // enable select box
    fieldNode.removeAttribute('disabled');
    // refresh select box options
    field.setControlValue(element, null, fieldNode, null, property);
    // return new selected value
    return fieldNode.value;
  }
  return null;
}

function refreshWorkspaces(element) {
  var property;
  var newWorkspaceId;
  // loading flag
  workspacesLoading = true;
  // ajax process
  getWorkspaces().then((values) => {
    workspaces = JSON.parse(values);
    // loading flag
    workspacesLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'workspaceId').workspaceId || null;
    // add entry if not contained
    if (
      property != null &&
      !workspaces.map(e => e.value).includes(property)
    ) {
      workspaces.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newWorkspaceId = enableAndResetValue(element, workspaceSelectBox, property);
    // refresh child item
    refreshApplications(element, newWorkspaceId);
  });
}

function refreshApplications(element, workspaceId) {
  var property;
  var newApplicationId;
  // loading flag
  applicationsLoading = true;
  // ajax process
  getApplicationsMail(workspaceId).then((values) => {
    applications = JSON.parse(values);
    // loading flag
    applicationsLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'applicationId').applicationId ||
      null;
    // add entry if not contained
    if (
      property != null &&
      !applications.map(e => e.value).includes(property)
    ) {
      applications.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newApplicationId = enableAndResetValue(
      element,
      applicationSelectBox,
      property
    );
    // refresh child item
    refreshTemplates(element, workspaceId, newApplicationId);
  });
}

function refreshTemplates(element, workspaceId, applicationId) {
  var property;
  var newTemplateId;
  // loading flag
  templatesLoading = true;
  // ajax process
  getTemplates(workspaceId, applicationId).then((values) => {
    templates = JSON.parse(values);
    // loading flag
    templatesLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'templateId').templateId || null;
    // add entry if not contained
    if (property != null && !pages.map(e => e.value).includes(property)) {
      templates.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newTemplateId = enableAndResetValue(element, templateSelectBox, property);
  });
}

export function baseAttributes(element, bpmnFactory, translate) {
  const serviceTaskProps = [];

  if (
    is(element, 'bpmn:ServiceTask') &&
    getBusinessObject(element).type === 'sendMail'
  ) {
    // emailFrom
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'emailFrom',
        description: translate('Email of the sender'),
        label: translate('From'),
        modelProperty: 'emailFrom',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'emailFrom');
        },
      })
    );

    // emailTo
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'emailTo',
        description: translate('Email of the recipient(s)'),
        label: translate('To'),
        modelProperty: 'emailTo',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'emailTo');
        },
      })
    );

    // emailCC
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'emailCC',
        description: translate('Carbon copy recipient(s)'),
        label: translate('CC'),
        modelProperty: 'emailCC',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'emailCC');
        },
      })
    );

    // emailBCC
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'emailBCC',
        description: translate('Blind carbon copy recipient(s)'),
        label: translate('BCC'),
        modelProperty: 'emailBCC',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'emailBCC');
        },
      })
    );

    // Reply To
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'emailReplyTo',
        description: translate('Email where the reply should be send'),
        label: translate('Reply To'),
        modelProperty: 'emailReplyTo',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'emailReplyTo');
        },
      })
    );
  }

  return serviceTaskProps;
}

export function contentAttributes(
  element,
  bpmnFactory,
  commandStack,
  translate
) {
  const serviceTaskProps = [];

  if (
    is(element, 'bpmn:ServiceTask') &&
    getBusinessObject(element).type === 'sendMail'
  ) {
    // Use Template: Yes/No
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'useTemplate',
        label: translate('Use Template'),
        modelProperty: 'useTemplate',
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' },
        ],
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'useTemplate');
        },
      })
    );

    // workspaceId
    workspaceSelectBox = entryFactory.selectBox(translate, {
      id: 'workspaceId',
      label: translate('Workspace'),
      modelProperty: 'workspaceId',

      selectOptions: function () {
        return workspaces;
      },

      disabled: function () {
        return workspacesLoading;
      },

      set: function (element, values) {
        // refresh templates
        refreshApplications(element, values.workspaceId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
      get: function (element) {
        // if visible
        if (
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
          'true'
        ) {
          // refresh workspaces (if necessary)
          if (elementIdentifier !== element) {
            elementIdentifier = element;
            // initiate ajax call for meta data
            refreshWorkspaces(element);
          }
        }
        return helper.getExtensionProperty(element, 'workspaceId');
      },
      hidden: function () {
        return (
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate === 'undefined' ||
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'false'
        );
      },
    });

    serviceTaskProps.push(workspaceSelectBox);

    // applicationId
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'applicationId',
      label: translate('Application'),
      modelProperty: 'applicationId',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return workspacesLoading || applicationsLoading;
      },

      set: function (element, values) {
        // workspaceId
        var { workspaceId } = helper.getExtensionProperty(
          element,
          'workspaceId'
        );
        // refresh templates
        refreshTemplates(element, workspaceId, values.applicationId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
      get: function (element) {
        return helper.getExtensionProperty(element, 'applicationId');
      },
      hidden: function () {
        return (
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate === 'undefined' ||
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'false'
        );
      },
    });

    serviceTaskProps.push(applicationSelectBox);

    // templateId
    templateSelectBox = entryFactory.selectBox(translate, {
      id: 'templateId',
      label: translate('Template'),
      modelProperty: 'templateId',

      selectOptions: function () {
        return templates;
      },

      disabled: function () {
        return workspacesLoading || applicationsLoading || templatesLoading;
      },

      set: function (element, values) {
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
      get: function (element) {
        return helper.getExtensionProperty(element, 'templateId');
      },
      hidden: function () {
        return (
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate === 'undefined' ||
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'false'
        );
      },
    });

    serviceTaskProps.push(templateSelectBox);

    // placeholder
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'placeholder',
        description: translate('Provide values for email template'),
        label: translate('Placeholder'),
        modelProperty: 'placeholder',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'placeholder');
        },
        show: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate !== 'undefined' &&
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'true'
          );
        },
      })
    );

    // container for placeholder editor
    serviceTaskProps.push(getContainer('placeholder'));

    // link to placeholder editor
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'placeholderEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getPlaceholder = function () {
            return helper.getExtensionProperty(element, 'placeholder')
              .placeholder;
          };
          var savePlaceholder = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              placeholder: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('placeholder', getPlaceholder, savePlaceholder, 'json');
        },
        showLink: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate !== 'undefined' &&
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'true'
          );
        },
      })
    );

    // subject
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'subject',
        label: translate('Subject'),
        modelProperty: 'subject',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'subject');
        },
        hidden: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate !== 'undefined' &&
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'true'
          );
        },
      })
    );

    // bodyText
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'bodyText',
        description: translate('Email content'),
        label: translate('Body Text'),
        modelProperty: 'bodyText',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'bodyText');
        },
        show: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined' ||
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'false'
          );
        },
      })
    );

    // bodyHTML
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'bodyHTML',
        description: translate('HTML version of the email'),
        label: translate('Body HTML'),
        modelProperty: 'bodyHTML',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'bodyHTML');
        },
        show: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined' ||
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'false'
          );
        },
      })
    );
  }
  return serviceTaskProps;
}

export function miscAttributes(element, bpmnFactory, commandStack, translate) {
  const serviceTaskProps = [];

  if (
    is(element, 'bpmn:ServiceTask') &&
    getBusinessObject(element).type === 'sendMail'
  ) {
    // attachment
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'attachment',
        description: translate('SQL query to get attachment'),
        label: translate('Attachment'),
        modelProperty: 'attachment',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'attachment');
        },
      })
    );

    // container for attachment editor
    serviceTaskProps.push(getContainer('attachment'));

    // link to attachment editor
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'attachmentEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getAttachment = function () {
            return helper.getExtensionProperty(element, 'attachment')
              .attachment;
          };
          var saveAttachment = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              attachment: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('attachment', getAttachment, saveAttachment, 'sql');
        },
      })
    );

    // Immediately: Yes/No
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'immediately',
        label: translate('Send Email Immediately'),
        modelProperty: 'immediately',
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' },
        ],
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'immediately');
        },
      })
    );
  }

  return serviceTaskProps;
}
