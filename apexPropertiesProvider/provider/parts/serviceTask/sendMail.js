import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../helper/propertiesHelper';
import {
  getApplicationsMail,
  getTemplates
} from '../../plugins/metaDataCollector';
import { getContainer, openEditor } from '../../plugins/monacoEditor';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var domQuery = require('min-dom').query;

var helper = new propertiesHelper('apex:SendMail');

// element identifier for current element
var elementIdentifier;

// select list options container
var applications = [];
var templates = [];

// select box container
var applicationSelectBox;
var templateSelectBox;

// loading flags
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

function refreshApplications(element) {
  var property;
  var newApplicationId;
  // loading flag
  applicationsLoading = true;
  // ajax process
  getApplicationsMail().then((values) => {
    applications = values;
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
    refreshTemplates(element, newApplicationId);
  });
}

function refreshTemplates(element, applicationId) {
  var property;
  var newTemplateId;
  // loading flag
  templatesLoading = true;
  // ajax process
  getTemplates(applicationId).then((values) => {
    templates = values;
    // loading flag
    templatesLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'templateId').templateId || null;
    // add entry if not contained
    if (property != null && !templates.map(e => e.value).includes(property)) {
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
    // Immediately: Yes/No
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'immediately',
        label: translate('Send Email Immediately'),
        modelProperty: 'immediately',
        selectOptions: [
          { name: translate('Yes'), value: 'true' },
          { name: translate('No'), value: 'false' },
        ],
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'immediately');
        },
      })
    );

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

  var enterQuickPick = function (values) {
    var commands = helper.setExtensionProperty(element, bpmnFactory, values);
    new MultiCommandHandler(commandStack).preExecute(commands);
  };

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

    // manualInput switch
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'inputSelection',
        label: 'Input',
        selectOptions: [
          { name: 'Use APEX meta data', value: 'false' },
          { name: 'Manual input', value: 'true' },
        ],
        modelProperty: 'manualInput',

        get: function (element) {
          var bo = getBusinessObject(element);
          return {
            manualInput: bo.get('manualInput'),
          };
        },

        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, values);
        },

        hidden: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined' ||
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'false'
          );
        },
      })
    );

    // application select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'applicationId',
      label: translate('Application'),
      modelProperty: 'applicationId',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return applicationsLoading;
      },

      set: function (element, values) {
        // refresh templates
        refreshTemplates(element, values.applicationId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
      get: function (element) {
        // if visible
        if (
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
          'true'
        ) {
          // refresh applications (if necessary)
          if (elementIdentifier !== element) {
            elementIdentifier = element;
            // initiate ajax call for meta data
            refreshApplications(element);
          }
        }
        var property = helper.getExtensionProperty(element, 'applicationId');
        // add entry if not contained
        if (
          property.applicationId != null &&
          !applications.map(e => e.value).includes(property.applicationId)
        ) {
          // filter out old custom entries
          applications = applications.filter(a => !a.name.endsWith('*'));
          // add entry
          applications.unshift({
            name: `${property.applicationId}*`,
            value: property.applicationId,
          });
        }
        return property;
      },
      hidden: function () {
        return (
          getBusinessObject(element).manualInput === 'true' ||
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate === 'undefined' ||
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'false'
        );
      },
    });

    serviceTaskProps.push(applicationSelectBox);

    // application text field
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'applicationIdText',
        label: translate('Application ID'),
        modelProperty: 'applicationId',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },

        get: function (element) {
          var property = helper.getExtensionProperty(element, 'applicationId');
          return property;
        },

        set: function (element, values, node) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );

    // template select list
    templateSelectBox = entryFactory.selectBox(translate, {
      id: 'templateId',
      label: translate('Template'),
      modelProperty: 'templateId',

      selectOptions: function () {
        return templates;
      },

      disabled: function () {
        return applicationsLoading || templatesLoading;
      },

      set: function (element, values) {
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
      get: function (element) {
        var property = helper.getExtensionProperty(element, 'templateId');
        // add entry if not contained
        if (
          property.templateId != null &&
          !templates.map(e => e.value).includes(property.templateId)
        ) {
          // filter out old custom entries
          templates = templates.filter(a => !a.name.endsWith('*'));
          // add entry
          templates.unshift({
            name: `${property.templateId}*`,
            value: property.templateId,
          });
        }
        return property;
      },
      hidden: function () {
        return (
          getBusinessObject(element).manualInput === 'true' ||
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate === 'undefined' ||
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'false'
        );
      },
    });

    serviceTaskProps.push(templateSelectBox);

    // template text field
    serviceTaskProps.push(
      entryFactory.textField(translate, {
        id: 'templateIdText',
        label: translate('Template ID'),
        modelProperty: 'templateId',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },

        get: function (element) {
          var property = helper.getExtensionProperty(element, 'templateId');
          return property;
        },

        set: function (element, values, node) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );

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

    // quick pick json placeholder
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-placeholder',
        buttonLabel: 'Load JSON',
        handleClick: function (element, node, event) {
          // ajaxIdentifier
          var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
          // ajax process
          apex.server
            .plugin(
              ajaxIdentifier,
              {
                x01: 'GET_JSON_PLACEHOLDERS',
                x02: helper.getExtensionProperty(element, 'applicationId')
                  .applicationId,
                x03: helper.getExtensionProperty(element, 'templateId')
                  .templateId,
              },
              {}
            )
            .then((pData) => {
              enterQuickPick({
                placeholder: JSON.stringify(pData, null, 1),
              });
            });
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

    // container for bodyText editor
    serviceTaskProps.push(getContainer('bodyText'));

    // link to bodyText editor
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'bodyTextEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getBodyText = function () {
            return helper.getExtensionProperty(element, 'bodyText').bodyText;
          };
          var saveBodyText = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              bodyText: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('bodyText', getBodyText, saveBodyText, 'plaintext');
        },
        showLink: function () {
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

    // container for bodyHTML editor
    serviceTaskProps.push(getContainer('bodyHTML'));

    // link to bodyHTML editor
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'bodyHTMLEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getBodyHTML = function () {
            return helper.getExtensionProperty(element, 'bodyHTML').bodyHTML;
          };
          var saveBodyHTML = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              bodyHTML: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('bodyHTML', getBodyHTML, saveBodyHTML, 'html');
        },
        showLink: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined' ||
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'false'
          );
        },
      })
    );

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
  }
  return serviceTaskProps;
}
