import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../extensionElements/propertiesHelper';
import subPropertiesHelper from '../../extensionElements/subPropertiesHelper';
import { getApplications, getItems, getPages } from './metaDataCollector';

var domQuery = require('min-dom').query;
var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');

var helper = new propertiesHelper('apex:ApexPage');

var subHelper = new subPropertiesHelper(
  'apex:ApexPage',
  'apex:PageItem',
  'pageItem',
  'pageItems',
  'apex:PageItems'
);

var forbiddenTypes = ['externalUrl', 'unifiedTaskList'];

// element identifier for current element
var elementIdentifier;

// select list options container
var applications = [];
var pages = [];
var items = [];

// extension element
var pageItemsElement;

// select box container
var applicationSelectBox;
var pageSelectBox;
var itemSelectBox;

// loading flags
var applicationsLoading;
var pagesLoading;
var itemsLoading;

function enableAndResetValue(element, field) {
  // get dom node
  var fieldNode = domQuery(`select[name="${field.id}"]`);
  if (fieldNode) {
    // get property value
    var property =
      helper.getExtensionProperty(element, field.id)[field.id] ||
      subHelper.getExtensionSubProperty(
        pageItemsElement,
        element,
        domQuery(`[data-entry="${field.id}"]`),
        field.id
      )[field.id] ||
      null;
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
  getApplications().then((values) => {
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
    refreshPages(element, newApplicationId);
  });
}

function refreshPages(element, applicationId) {
  var newPageId;
  // loading flag
  pagesLoading = true;
  // ajax process
  getPages(applicationId).then((values) => {
    pages = JSON.parse(values);
    // loading flag
    pagesLoading = false;
    // refresh select box
    newPageId = enableAndResetValue(element, pageSelectBox, false);
    // refresh child item
    refreshItems(element, applicationId, newPageId);
  });
}

function refreshItems(element, applicationId, pageId) {
  var newItemName;
  // loading flag
  itemsLoading = true;
  // ajax process
  getItems(applicationId, pageId).then((values) => {
    items = JSON.parse(values);
    // loading flag
    itemsLoading = false;
    // refresh select box
    newItemName = enableAndResetValue(element, itemSelectBox, true);
  });
}

export default function (element, bpmnFactory, elementRegistry, translate) {
  const userTaskProps = [];

  var enterQuickPick = function (node, values) {
    var command = subHelper.setExtensionSubProperty(
      pageItemsElement,
      element,
      node,
      values
    );
    new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
      command.context
    );
  };

  var { type } = getBusinessObject(element);

  if (
    is(element, 'bpmn:UserTask') &&
    (typeof type === 'undefined' ||
      type === 'apexPage' ||
      !forbiddenTypes.includes(type))
  ) {
    if (elementIdentifier !== element) {
      elementIdentifier = element;
      // initiate ajax call for meta data
      refreshApplications(element);
    }

    // applications select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'applicationId',
      // description: translate('Application ID or Alias'),
      label: translate('Application'),
      modelProperty: 'applicationId',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return applicationsLoading;
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'applicationId');
        return property;
      },

      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values.applicationId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(applicationSelectBox);

    // page select list
    pageSelectBox = entryFactory.selectBox(translate, {
      id: 'pageId',
      // description: translate('Page ID or Alias'),
      label: translate('Page'),
      modelProperty: 'pageId',

      selectOptions: function () {
        return pages;
      },

      disabled: function () {
        return applicationsLoading || pagesLoading;
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'pageId');
        return property;
      },

      set: function (element, values, node) {
        // applicationId
        var { applicationId } = helper.getExtensionProperty(
          element,
          'applicationId'
        );
        // refresh items
        refreshItems(element, applicationId, values.pageId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(pageSelectBox);

    pageItemsElement = extensionElementsEntry(element, bpmnFactory, {
      id: 'pageItems',
      label: translate('Page Items'),

      // function (element, extensionsElements, values)
      createExtensionElement: function (element, extensionElements, values) {
        return subHelper.newElement(element, extensionElements, bpmnFactory, {
          itemName: '',
          itemValue: '',
        });
      },

      // function (element, extensionsElements, value, idx)
      removeExtensionElement: function (
        element,
        extensionElements,
        value,
        idx
      ) {
        return subHelper.removeElement(element, extensionElements, idx);
      },

      getExtensionElements: function (element) {
        return subHelper.getEntries(element);
      },

      // function (element, node, option, property, value, idx)
      setOptionLabelValue: function (
        element,
        node,
        option,
        property,
        value,
        idx
      ) {
        subHelper.setOptionLabelValue(
          element,
          option,
          'itemName',
          'itemValue',
          'itemValue',
          idx
        );
      },
    });

    userTaskProps.push(pageItemsElement);

    // item select list
    itemSelectBox = entryFactory.selectBox(translate, {
      id: 'itemName',
      escription: translate('Name of the page item'),
      label: translate('Item Name'),
      modelProperty: 'itemName',

      selectOptions: function () {
        return items;
      },

      disabled: function () {
        return applicationsLoading || pagesLoading || itemsLoading;
      },

      get: function (element, node) {
        var property = subHelper.getExtensionSubProperty(
          pageItemsElement,
          element,
          node,
          'itemName'
        );
        return property;
      },

      set: function (element, values, node) {
        return subHelper.setExtensionSubProperty(
          pageItemsElement,
          element,
          node,
          values
        );
      },

      hidden: function (element, node) {
        return subHelper.isNotSelected(pageItemsElement, element, node);
      },
    });

    userTaskProps.push(itemSelectBox);

    // item value
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'itemValue',
        // description: translate('Value of the page item'),
        label: translate('Item Value'),
        modelProperty: 'itemValue',

        get: function (element, node) {
          return subHelper.getExtensionSubProperty(
            pageItemsElement,
            element,
            node,
            'itemValue'
          );
        },

        set: function (element, values, node) {
          return subHelper.setExtensionSubProperty(
            pageItemsElement,
            element,
            node,
            values
          );
        },

        hidden: function (element, node) {
          return subHelper.isNotSelected(pageItemsElement, element, node);
        },
      })
    );

    // quick pick process_id
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-process-id',
        buttonLabel: 'process_id',
        handleClick: function (element, node, event) {
          enterQuickPick(node, {
            itemValue: '&F4A$PROCESS_ID.',
          });
        },
        showLink: function (element, node) {
          return subHelper.isSelected(pageItemsElement, element, node);
        },
      })
    );

    // quick pick subflow_id
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-subflow-id',
        buttonLabel: 'subflow_id',
        handleClick: function (element, node, event) {
          enterQuickPick(node, {
            itemValue: '&F4A$SUBFLOW_ID.',
          });
        },
        showLink: function (element, node) {
          return subHelper.isSelected(pageItemsElement, element, node);
        },
      })
    );

    // quick pick step_key
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-step-key',
        buttonLabel: 'step_key',
        handleClick: function (element, node, event) {
          enterQuickPick(node, {
            itemValue: '&F4A$STEP_KEY.',
          });
        },
        showLink: function (element, node) {
          return subHelper.isSelected(pageItemsElement, element, node);
        },
      })
    );

    // quick pick business_ref
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-business-ref',
        buttonLabel: 'business_ref',
        handleClick: function (element, node, event) {
          enterQuickPick(node, {
            itemValue: '&F4A$BUSINESS_REF.',
          });
        },
        showLink: function (element, node) {
          return subHelper.isSelected(pageItemsElement, element, node);
        },
      })
    );

    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'request',

        get: function (element) {
          return helper.getExtensionProperty(element, 'request');
        },

        set: function (element, values) {
          // set value
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'cache',

        get: function (element) {
          return helper.getExtensionProperty(element, 'cache');
        },

        set: function (element, values) {
          // set value
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );
  }

  return userTaskProps;
}
