import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import PropertiesHelper from '../../helper/propertiesHelper';
import SubPropertiesHelper from '../../helper/subPropertiesHelper';
import {
  getApplications,
  getItems,
  getPages
} from '../../plugins/metaDataCollector';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var domQuery = require('min-dom').query;
var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new PropertiesHelper('apex:ApexPage');

var subHelper = new SubPropertiesHelper(
  'apex:ApexPage',
  'apex:PageItem',
  'pageItem',
  'pageItems',
  'apex:PageItems'
);

var forbiddenTypes = ['externalUrl', 'apexApproval'];

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
  getApplications().then((values) => {
    // loading flag
    applicationsLoading = false;
    if (values) {
      applications = values;

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
      refreshPages(element, newApplicationId);
    }
  });
}

function refreshPages(element, applicationId) {
  var property;
  var newPageId;
  // loading flag
  pagesLoading = true;
  // ajax process
  getPages(applicationId).then((values) => {
    // loading flag
    pagesLoading = false;
    if (values) {
      pages = values;
      // get property value
      property = helper.getExtensionProperty(element, 'pageId').pageId || null;
      // add entry if not contained
      if (property != null && !pages.map(e => e.value).includes(property)) {
        pages.unshift({ name: `${property}*`, value: property });
      }
      // refresh select box
      newPageId = enableAndResetValue(element, pageSelectBox, property);
      // refresh child item
      refreshItems(element, applicationId, newPageId);
    }
  });
}

function refreshItems(element, applicationId, pageId) {
  var property;
  var newItemName;
  // loading flag
  itemsLoading = true;
  // ajax process
  getItems(applicationId, pageId).then((values) => {
    // loading flag
    itemsLoading = false;
    if (values) {
      items = values;
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
      newItemName = enableAndResetValue(element, itemSelectBox, property);
    }
  });
}

export default function (
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
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

  var createUserTaskItems = function () {
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;
    if (!extensions) {
      var command = SubPropertiesHelper.createExtensionElement(
        element,
        bpmnFactory
      );
      new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
        command.context
      );
    }
    extensions = bo.extensionElements;
    const handler = new MultiCommandHandler(commandStack);
    handler.preExecute(
      subHelper.newElement(element, extensions, bpmnFactory, {
        itemName: 'PROCESS_ID',
        itemValue: '&F4A$PROCESS_ID.',
      })
    );
    handler.preExecute(
      subHelper.newElement(element, extensions, bpmnFactory, {
        itemName: 'SUBFLOW_ID',
        itemValue: '&F4A$SUBFLOW_ID.',
      })
    );
    handler.preExecute(
      subHelper.newElement(element, extensions, bpmnFactory, {
        itemName: 'STEP_KEY',
        itemValue: '&F4A$STEP_KEY.',
      })
    );
  };

  var { type } = getBusinessObject(element);

  if (
    is(element, 'bpmn:UserTask') &&
    (typeof type === 'undefined' ||
      type === 'apexPage' ||
      !forbiddenTypes.includes(type))
  ) {
    // manualInput switch
    userTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'inputSelection',
        label: translate('Input'),
        selectOptions: [
          { name: translate('Use APEX meta data'), value: 'false' },
          { name: translate('Manual input'), value: 'true' },
        ],
        modelProperty: 'manualInput',

        get: function (element) {
          var bo = getBusinessObject(element);
          var value = bo.get('manualInput');

          if (typeof value === 'undefined') {
            var command = cmdHelper.updateBusinessObject(element, bo, {
              manualInput: 'false',
            });
            new UpdateBusinessObjectHandler(
              elementRegistry,
              bpmnFactory
            ).execute(command.context);
          }

          return {
            manualInput: bo.get('manualInput'),
          };
        },

        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, values);
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

      hidden: function (element) {
        return getBusinessObject(element).manualInput === 'true';
      },

      get: function (element) {
        // refresh applications (if necessary)
        if (elementIdentifier !== element) {
          elementIdentifier = element;
          refreshApplications(element);
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

      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values.applicationId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(applicationSelectBox);

    // application text field
    userTaskProps.push(
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

      hidden: function (element) {
        return getBusinessObject(element).manualInput === 'true';
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'pageId');
        // add entry if not contained
        if (
          property.pageId != null &&
          !pages.map(e => e.value).includes(property.pageId)
        ) {
          // filter out old custom entries
          pages = pages.filter(p => !p.name.endsWith('*'));
          // add entry
          pages.unshift({
            name: `${property.pageId}*`,
            value: property.pageId,
          });
        }
        return property;
      },

      set: function (element, values, node) {
        // application
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

    // page text field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'pageIdText',
        label: translate('Page ID'),
        modelProperty: 'pageId',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },

        get: function (element) {
          var property = helper.getExtensionProperty(element, 'pageId');
          return property;
        },

        set: function (element, values, node) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );

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
        // application
        var { applicationId } = helper.getExtensionProperty(
          element,
          'applicationId'
        );
        // page
        var { pageId } = helper.getExtensionProperty(element, 'pageId');
        // refresh items
        refreshItems(element, applicationId, pageId);
      },
    });

    userTaskProps.push(pageItemsElement);

    // items quick pick
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-items',
        buttonLabel: translate('Generate Default'),
        handleClick: function (element, node, event) {
          createUserTaskItems();
        },
      })
    );

    // item select list
    itemSelectBox = entryFactory.selectBox(translate, {
      id: 'itemName',
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
        // add entry if not contained
        if (
          property.itemName != null &&
          !items.map(e => e.value).includes(property.itemName)
        ) {
          // filter out old custom entries
          items = items.filter(i => !i.name.endsWith('*'));
          // add entry
          items.unshift({
            name: `${property.itemName}*`,
            value: property.itemName,
          });
        }
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
        return (
          getBusinessObject(element).manualInput === 'true' ||
          subHelper.isNotSelected(pageItemsElement, element, node)
        );
      },
    });

    userTaskProps.push(itemSelectBox);

    // item text field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'itemNameText',
        label: translate('Item Name'),
        modelProperty: 'itemName',

        hidden: function (element, node) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false' ||
            subHelper.isNotSelected(pageItemsElement, element, node)
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
      })
    );

    // item value
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'itemValue',
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
        buttonLabel: translate('process_id'),
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
        buttonLabel: translate('subflow_id'),
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
        buttonLabel: translate('step_key'),
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
        buttonLabel: translate('business_ref'),
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
