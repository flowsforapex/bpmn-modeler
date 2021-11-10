import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { getContainer, openEditor } from '../../customElements/monacoEditor';
import propertiesHelper from '../../extensionElements/propertiesHelper';
import {
  getApplicationsMail,
  getTemplates
} from '../userTask/metaDataCollector';

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

function enableAndResetValue(element, field) {
  // get dom node
  var fieldNode = domQuery(`select[name="${field.id}"]`);
  var property;
  if (fieldNode) {
    // get property value
    property = helper.getExtensionProperty(element, field.id)[field.id];
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
  var newApplicationId;
  // loading flag
  applicationsLoading = true;
  // ajax process
  getApplicationsMail().then((values) => {
    applications = JSON.parse(values);
    // loading flag
    applicationsLoading = false;
    // refresh select box
    newApplicationId = enableAndResetValue(
      element,
      applicationSelectBox,
      false
    );
    // refresh child item
    refreshTemplates(element, newApplicationId);
  });
}

function refreshTemplates(element, applicationId) {
  var newTemplateId;
  // loading flag
  templatesLoading = true;
  // ajax process
  getTemplates(applicationId).then((values) => {
    templates = JSON.parse(values);
    // loading flag
    templatesLoading = false;
    // refresh select box
    newTemplateId = enableAndResetValue(element, templateSelectBox, false);
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
        validate: function (element, node) {
          var value = helper.getExtensionProperty(
            element,
            'emailFrom'
          ).emailFrom;
          if (!value) {
            return {
              emailFrom: translate('Must provide a value'),
            };
          }
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
        validate: function (element, node) {
          var value = helper.getExtensionProperty(element, 'emailTo').emailTo;
          if (!value) {
            return {
              emailTo: translate('Must provide a value'),
            };
          }
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
    if (elementIdentifier !== element) {
      elementIdentifier = element;
      // initiate ajax call for meta data
      refreshApplications(element);
    }

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

    // applicationId
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
      validate: function (element, node) {
        var value = helper.getExtensionProperty(
          element,
          'applicationId'
        ).applicationId;
        var visible =
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate !== 'undefined' &&
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'true';
        if (visible && !value) {
          return {
            applicationId: translate('Must provide a value'),
          };
        }
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
        return applicationsLoading || templatesLoading;
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
      validate: function (element, node) {
        var value = helper.getExtensionProperty(
          element,
          'templateId'
        ).templateId;
        var visible =
          typeof helper.getExtensionProperty(element, 'useTemplate')
            .useTemplate !== 'undefined' &&
          helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
            'true';
        if (visible && !value) {
          return {
            templateId: translate('Must provide a value'),
          };
        }
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
        validate: function (element, node) {
          var value = helper.getExtensionProperty(element, 'bodyText').bodyText;
          var visible =
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined' ||
            helper.getExtensionProperty(element, 'useTemplate').useTemplate ===
              'false';
          if (visible && !value) {
            return {
              bodyText: translate('Must provide a value'),
            };
          }
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
    // attachement
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'attachement',
        description: translate('SQL query to get attachement'),
        label: translate('Attachement'),
        modelProperty: 'attachement',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'attachement');
        },
      })
    );

    // container for attachement editor
    serviceTaskProps.push(getContainer('attachement'));

    // link to attachement editor
    serviceTaskProps.push(
      entryFactory.link(translate, {
        id: 'attachementEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getAttachement = function () {
            return helper.getExtensionProperty(element, 'attachement')
              .attachement;
          };
          var saveAttachement = function (text) {
            var commands = helper.setExtensionProperty(element, bpmnFactory, {
              attachement: text,
            });
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('attachement', getAttachement, saveAttachement, 'sql');
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
