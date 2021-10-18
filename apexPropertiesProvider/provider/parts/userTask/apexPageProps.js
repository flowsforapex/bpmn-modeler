import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import {
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
var applicationLoading = false;
var pagesLoading = false;

function enableAndRefresh(element, ...fields) {
  fields.forEach((f) => {
    // get dom node
    var fieldNode = domQuery(`select[name="${f.id}"]`);
    // get value
    var property =
      getExtensionProperty(element, 'apex:ApexPage', f.id)[f.id] ||
      getExtensionSubProperty(
        pageItemsElement,
        element,
        domQuery(`[data-entry="${f.id}"]`),
        f.id
      )[f.id] ||
      null;
    if (fieldNode) {
      // enable select box
      fieldNode.removeAttribute('disabled');
      // refresh select box options
      f.setControlValue(element, null, fieldNode, null, property);
    }
  });
}

function refreshApplications(element) {
  // loading flag
  applicationLoading = true;
  // ajax process
  getApplications().then((values) => {
    applications = JSON.parse(values);
    // loading flag
    applicationLoading = false;
    // refresh
    enableAndRefresh(
      element,
      applicationSelectBox,
      pageSelectBox,
      itemSelectBox
    );
  });
}

function refreshPages(element, values) {
  // applicationId
  var { applicationId } = values;
  // loading flag
  pagesLoading = true;
  // ajax process
  getPages(applicationId).then((values) => {
    pages = JSON.parse(values);
    // loading flag
    pagesLoading = false;
    // refresh
    enableAndRefresh(element, pageSelectBox, itemSelectBox);
  });
}

function refreshItems(element, values) {
  // applicationId
  var { applicationId } = getExtensionProperty(
    element,
    'apex:ApexPage',
    'applicationId'
  );
  // pageId
  var { pageId } = values;
  // ajax process
  getItems(applicationId, pageId).then((values) => {
    items = JSON.parse(values);
    // refresh
    enableAndRefresh(element, itemSelectBox);
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
        return applicationLoading;
      },

      get: function (element) {
        var property = getExtensionProperty(
          element,
          'apex:ApexPage',
          'applicationId'
        );
        if (applications.length === 0) refreshApplications(element);
        return property;
      },

      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values);
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
        return applicationLoading || pagesLoading;
      },

      get: function (element) {
        var property = getExtensionProperty(element, 'apex:ApexPage', 'pageId');
        if (pages.length === 0) refreshPages(element, property);
        return property;
      },

      set: function (element, values, node) {
        // refresh items
        refreshItems(element, values);
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
        return applicationLoading || pagesLoading;
      },

      get: function (element, node) {
        var property = getExtensionSubProperty(
          pageItemsElement,
          element,
          node,
          'itemName'
        );
        if (items.length === 0) items = refreshItems(element, property);
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
