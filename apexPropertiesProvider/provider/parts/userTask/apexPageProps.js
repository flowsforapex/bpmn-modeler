import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import {
  clearExtensionProperty,
  getExtensionProperty,
  setExtensionProperty
} from '../../extensionElements/propertiesHelper';
import {
  getEntries,
  getExtensionSubProperty,
  isNotSelected,
  newElement,
  removeElement,
  setExtensionSubProperty,
  setOptionLabelValue
} from '../../extensionElements/subPropertiesHelper';
import { getApplications, getItems, getPages } from './metaDataCollector';

var domQuery = require('min-dom').query;

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');

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
  // get property value
  var property =
    getExtensionProperty(element, 'apex:ApexPage', field.id)[field.id] ||
    getExtensionSubProperty(
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
  var storedPageId;
  // loading flag
  pagesLoading = true;
  // ajax process
  getPages(applicationId).then((values) => {
    pages = JSON.parse(values);
    // loading flag
    pagesLoading = false;
    // refresh select box
    newPageId = enableAndResetValue(element, pageSelectBox, false);
    // get pageId from business object
    storedPageId = getExtensionProperty(
      element,
      'apex:ApexPage',
      'pageId'
    ).pageId;
    // clear business object if pageId empty
    if (typeof storedPageId !== 'undefined' && newPageId !== storedPageId) {
      clearExtensionProperty(element, 'apex:ApexPage', 'pageId');
    }
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

export default function (element, bpmnFactory, translate) {
  const userTaskProps = [];

  // Only return an entry, if the currently selected element is a UserTask.
  if (
    is(element, 'bpmn:UserTask') &&
    (typeof getBusinessObject(element).type === 'undefined' ||
      getBusinessObject(element).type === 'apexPage')
  ) {
    // applications select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'applicationId',
      description: translate('Application ID or Alias'),
      label: translate('Application'),
      modelProperty: 'applicationId',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return applicationsLoading;
      },

      get: function (element) {
        var property = getExtensionProperty(
          element,
          'apex:ApexPage',
          'applicationId'
        );
        // initiate ajax call for meta data
        if (applications.length === 0) refreshApplications(element);
        return property;
      },

      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values.applicationId);
        // set value
        return setExtensionProperty(
          element,
          bpmnFactory,
          'apex:ApexPage',
          values
        );
      },
    });

    userTaskProps.push(applicationSelectBox);

    // page select list
    pageSelectBox = entryFactory.selectBox(translate, {
      id: 'pageId',
      description: translate('Page ID or Alias'),
      label: translate('Page'),
      modelProperty: 'pageId',

      selectOptions: function () {
        return pages;
      },

      disabled: function () {
        return applicationsLoading || pagesLoading;
      },

      get: function (element) {
        var property = getExtensionProperty(element, 'apex:ApexPage', 'pageId');
        return property;
      },

      set: function (element, values, node) {
        // applicationId
        var { applicationId } = getExtensionProperty(
          element,
          'apex:ApexPage',
          'applicationId'
        );
        // refresh items
        refreshItems(element, applicationId, values.pageId);
        // set value
        return setExtensionProperty(
          element,
          bpmnFactory,
          'apex:ApexPage',
          values
        );
      },
    });

    userTaskProps.push(pageSelectBox);

    pageItemsElement = extensionElementsEntry(element, bpmnFactory, {
      id: 'pageItems',
      label: translate('Page Items'),

      // function (element, extensionsElements, values)
      createExtensionElement: function (element, extensionElements, values) {
        return newElement(
          element,
          extensionElements,
          bpmnFactory,
          'apex:ApexPage',
          'apex:PageItem',
          'pageItems',
          {
            itemName: '',
            itemValue: '',
          }
        );
      },

      // function (element, extensionsElements, value, idx)
      removeExtensionElement: function (
        element,
        extensionElements,
        value,
        idx
      ) {
        return removeElement(
          element,
          extensionElements,
          'apex:ApexPage',
          'pageItems',
          idx
        );
      },

      getExtensionElements: function (element) {
        return getEntries(element);
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
        setOptionLabelValue(
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
        var property = getExtensionSubProperty(
          pageItemsElement,
          element,
          node,
          'itemName'
        );
        return property;
      },

      set: function (element, values, node) {
        return setExtensionSubProperty(pageItemsElement, element, node, values);
      },

      hidden: function (element, node) {
        return isNotSelected(pageItemsElement, element, node);
      },
    });

    userTaskProps.push(itemSelectBox);

    // name field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'itemValue',
        description: translate('Value of the page item'),
        label: translate('Item Value'),
        modelProperty: 'itemValue',

        get: function (element, node) {
          return getExtensionSubProperty(
            pageItemsElement,
            element,
            node,
            'itemValue'
          );
        },

        set: function (element, values, node) {
          return setExtensionSubProperty(
            pageItemsElement,
            element,
            node,
            values
          );
        },

        hidden: function (element, node) {
          return isNotSelected(pageItemsElement, element, node);
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
          return getExtensionProperty(element, 'apex:ApexPage', 'request');
        },

        set: function (element, values) {
          // set value
          return setExtensionProperty(
            element,
            bpmnFactory,
            'apex:ApexPage',
            values
          );
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
          return getExtensionProperty(element, 'apex:ApexPage', 'cache');
        },

        set: function (element, values) {
          // set value
          return setExtensionProperty(
            element,
            bpmnFactory,
            'apex:ApexPage',
            values
          );
        },
      })
    );
  }

  return userTaskProps;
}
