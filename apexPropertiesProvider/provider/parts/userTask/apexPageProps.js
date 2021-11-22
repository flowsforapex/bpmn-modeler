import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import propertiesHelper from '../../helper/propertiesHelper';
import subPropertiesHelper from '../../helper/subPropertiesHelper';
import {
  getApplications,
  getItems,
  getPages,
  getWorkspaces
} from '../../plugins/metaDataCollector';

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
var workspaces = [];
var applications = [];
var pages = [];
var items = [];

// extension element
var pageItemsElement;

// select box container
var workspaceSelectBox;
var applicationSelectBox;
var pageSelectBox;
var itemSelectBox;

// loading flags
var workspacesLoading;
var applicationsLoading;
var pagesLoading;
var itemsLoading;

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
  var newWorkspace;
  // loading flag
  workspacesLoading = true;
  // ajax process
  getWorkspaces().then((values) => {
    workspaces = JSON.parse(values);
    // loading flag
    workspacesLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'workspace').workspace || null;
    // add entry if not contained
    if (
      property != null &&
      !workspaces.map(e => e.value).includes(property)
    ) {
      workspaces.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newWorkspace = enableAndResetValue(element, workspaceSelectBox, property);
    // refresh child item
    refreshApplications(element, newWorkspace);
  });
}

function refreshApplications(element, workspace) {
  var property;
  var newApplication;
  // loading flag
  applicationsLoading = true;
  // ajax process
  getApplications(workspace).then((values) => {
    applications = JSON.parse(values);
    // loading flag
    applicationsLoading = false;
    // get property value
    property =
      helper.getExtensionProperty(element, 'application').application || null;
    // add entry if not contained
    if (
      property != null &&
      !applications.map(e => e.value).includes(property)
    ) {
      applications.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newApplication = enableAndResetValue(
      element,
      applicationSelectBox,
      property
    );
    // refresh child item
    refreshPages(element, workspace, newApplication);
  });
}

function refreshPages(element, workspace, application) {
  var property;
  var newPage;
  // loading flag
  pagesLoading = true;
  // ajax process
  getPages(workspace, application).then((values) => {
    pages = JSON.parse(values);
    // loading flag
    pagesLoading = false;
    // get property value
    property = helper.getExtensionProperty(element, 'page').page || null;
    // add entry if not contained
    if (property != null && !pages.map(e => e.value).includes(property)) {
      pages.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newPage = enableAndResetValue(element, pageSelectBox, property);
    // refresh child item
    refreshItems(element, workspace, application, newPage);
  });
}

function refreshItems(element, workspace, application, page) {
  var property;
  var newItem;
  // loading flag
  itemsLoading = true;
  // ajax process
  getItems(workspace, application, page).then((values) => {
    items = JSON.parse(values);
    // loading flag
    itemsLoading = false;
    // get property value
    property =
      subHelper.getExtensionSubProperty(
        pageItemsElement,
        element,
        pageSelectBox,
        'itemName'
      ).itemName || null;
    // add entry if not contained
    if (property != null && !items.map(e => e.value).includes(property)) {
      items.unshift({ name: `${property}*`, value: property });
    }
    // refresh select box
    newItem = enableAndResetValue(element, itemSelectBox, property);
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
    // workspaces select list
    workspaceSelectBox = entryFactory.selectBox(translate, {
      id: 'workspace',
      label: translate('Workspace'),
      modelProperty: 'workspace',

      selectOptions: function () {
        return workspaces;
      },

      disabled: function () {
        return workspacesLoading;
      },

      get: function (element) {
        // refresh workspaces (if necessary)
        if (elementIdentifier !== element) {
          elementIdentifier = element;
          refreshWorkspaces(element);
        }
        var property = helper.getExtensionProperty(element, 'workspace');
        return property;
      },

      set: function (element, values, node) {
        // refresh applications
        refreshApplications(element, values.workspace);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(workspaceSelectBox);

    // applications select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'application',
      // description: translate('Application ID or Alias'),
      label: translate('Application'),
      modelProperty: 'application',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return workspacesLoading || applicationsLoading;
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'application');
        return property;
      },

      set: function (element, values, node) {
        // workspace
        var { workspace } = helper.getExtensionProperty(element, 'workspace');
        // refresh pages
        refreshPages(element, workspace, values.application);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(applicationSelectBox);

    // page select list
    pageSelectBox = entryFactory.selectBox(translate, {
      id: 'page',
      // description: translate('Page ID or Alias'),
      label: translate('Page'),
      modelProperty: 'page',

      selectOptions: function () {
        return pages;
      },

      disabled: function () {
        return workspacesLoading || applicationsLoading || pagesLoading;
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'page');
        return property;
      },

      set: function (element, values, node) {
        // workspace
        var { workspace } = helper.getExtensionProperty(element, 'workspace');
        // application
        var { application } = helper.getExtensionProperty(
          element,
          'application'
        );
        // refresh items
        refreshItems(element, workspace, application, values.page);
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

      onSelectionChange: function (element, node) {
        // workspace
        var { workspace } = helper.getExtensionProperty(element, 'workspace');
        // application
        var { application } = helper.getExtensionProperty(
          element,
          'application'
        );
        // page
        var { page } = helper.getExtensionProperty(element, 'page');
        // refresh items
        refreshItems(element, workspace, application, page);
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
        return (
          workspacesLoading ||
          applicationsLoading ||
          pagesLoading ||
          itemsLoading
        );
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

    // quick pick
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

    // quick pick
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

    // quick pick
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
