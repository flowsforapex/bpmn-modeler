import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../extensionElements/propertiesHelper';

var helper = new propertiesHelper('apex:SendMail');

export default function (element, bpmnFactory, commandStack, translate) {
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

    // Use Template: Yes/No
    serviceTaskProps.push(
      entryFactory.checkbox(translate, {
        id: 'useTemplate',
        label: translate('Use Template'),
        modelProperty: 'useTemplate',
        set: function (element, values) {
          var props = { useTemplate: values.useTemplate };
          return helper.setExtensionProperty(element, bpmnFactory, props);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'useTemplate');
        },
      })
    );

    // applicationId
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'applicationId',
        label: translate('Application'),
        modelProperty: 'applicationId',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'applicationId');
        },
        hidden: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined'
          );
        },
      })
    );

    // templateId
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'templateId',
        label: translate('Template'),
        modelProperty: 'templateId',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'templateId');
        },
        hidden: function () {
          return (
            typeof helper.getExtensionProperty(element, 'useTemplate')
              .useTemplate === 'undefined'
          );
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
              .useTemplate !== 'undefined'
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
              .useTemplate === 'undefined'
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
              .useTemplate === 'undefined'
          );
        },
      })
    );

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

    // Immediately: Yes/No
    serviceTaskProps.push(
      entryFactory.checkbox(translate, {
        id: 'immediately',
        description: translate('Send email immediately'),
        label: translate('Immediately'),
        modelProperty: 'immediately',
        set: function (element, values) {
          var props = { immediately: values.immediately };
          return helper.setExtensionProperty(element, bpmnFactory, props);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'immediately');
        },
      })
    );
  }

  return serviceTaskProps;
}
