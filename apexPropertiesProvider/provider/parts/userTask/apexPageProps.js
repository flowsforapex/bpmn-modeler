import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var domQuery = require('min-dom').query;

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

// select list options container
var applications = [];
var pages = [];
var items = [];

// extension element
var pageItemsElement;

var setOptionLabelValue = function () {
  return function (element, node, option, property, value, idx) {
    var entries = getEntries(element);
    var entry = entries[idx];

    var label = entry ? `${entry.get('itemName')}:${entry.get('itemValue')}` : '';

    option.text = label;
    option.value = entry && entry.get('itemName');
  };
};

var newElement = function (bpmnFactory, props) {
  return function (element, extensionElements, values) {
    var commands = [];
    var newElem;

    var [container] = extensionElementsHelper.getExtensionElements(
      getBusinessObject(element),
      'apex:ApexPage'
    );

    if (!container) {
      container = elementHelper.createElement(
        'apex:ApexPage',
        {},
        extensionElements,
        bpmnFactory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, extensionElements, 'values', [
          container,
        ])
      );
    }

    values = {
      itemName: props.itemName,
      itemValue: props.itemValue,
    };

    newElem = elementHelper.createElement(
      'apex:PageItem',
      values,
      container,
      bpmnFactory
    );
    commands.push(
      cmdHelper.addElementsTolist(element, container, 'pageItems', [newElem])
    );

    return commands;
  };
};

var removeElement = function () {
  return function (element, extensionElements, value, idx) {
    var command;

    var [container] = extensionElementsHelper.getExtensionElements(
      getBusinessObject(element),
      'apex:ApexPage'
    );

    var entries = getEntries(element);
    var entry = entries[idx];

    command =
      container.pageItems.length > 1 ? (command = cmdHelper.removeElementsFromList(
            element,
            container,
            'pageItems',
            'extensionElements',
            [entry]
          )) : cmdHelper.updateBusinessObject(element, container, {
            pageItems: '',
          });

    return command;
  };
};

var getExtProperty = function (property) {
  return function (element, node) {
    var entry = getSelectedEntry(element, node);

    return {
      [property]: (entry && entry.get(property)) || undefined,
    };
  };
};

var setExtProperty = function () {
  return function (element, values, node) {
    var entry = getSelectedEntry(element, node);

    return cmdHelper.updateBusinessObject(element, entry, values);
  };
};

var isNotSelected = function () {
  return function (element, node) {
    return typeof getSelectedEntry(element, node) === 'undefined';
  };
};

// property getter
var getProperty = function (property) {
  return function (element) {
    var bo = getBusinessObject(element);

    const [apexPage] = extensionElementsHelper.getExtensionElements(
      bo,
      'apex:ApexPage'
    );

    return {
      [property]: apexPage && apexPage.get(property),
    };
  };
};

// property setter
var setProperty = function (element, bpmnFactory, values) {
  var commands = [];
  var bo = getBusinessObject(element);
  var extensions = bo.extensionElements;

  if (!extensions) {
    extensions = elementHelper.createElement(
      'bpmn:ExtensionElements',
      {},
      bo,
      bpmnFactory
    );
    commands.push(
      cmdHelper.updateProperties(element, { extensionElements: extensions })
    );
  }

  let [apexPage] = extensionElementsHelper.getExtensionElements(
    bo,
    'apex:ApexPage'
  );

  if (!apexPage) {
    apexPage = elementHelper.createElement(
      'apex:ApexPage',
      {},
      extensionElementsHelper,
      bpmnFactory
    );
    commands.push(
      cmdHelper.addElementsTolist(element, extensions, 'values', [apexPage])
    );
  }

  commands.push(cmdHelper.updateBusinessObject(element, apexPage, values));

  return commands;
};

// select box container
var applicationSelectBox;
var pageSelectBox;
var itemSelectBox;

// loading flags
var metadataLoading = false;
var applicationLoading = false;
var pagesLoading = false;

function enableAndRefresh(element, ...fields) {
  fields.forEach((f) => {
    // get dom node
    var fieldNode = domQuery(`select[name="${f.id}"]`);
    if (fieldNode) {
      // enable select box
      fieldNode.removeAttribute('disabled');
      // refresh select box options
      f.setControlValue(element, null, fieldNode, null, fieldNode.value);
    }
  });
}

function getApplications(element) {
  // loading flag
  metadataLoading = true;
  // ajax process
  apex.server.process(
    'GET_APPLICATIONS',
    {},
    {
      dataType: 'text',
      success: function (data) {
        applications = JSON.parse(data);
        metadataLoading = false;
        enableAndRefresh(
          element,
          applicationSelectBox,
          pageSelectBox,
          itemSelectBox
        );
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}

function getPages(element, values) {
  // loading flag
  applicationLoading = true;
  // ajax process
  apex.server.process(
    'GET_PAGES',
    { x01: values.applicationId },
    {
      dataType: 'text',
      success: function (data) {
        pages = JSON.parse(data);
        applicationLoading = false;
        enableAndRefresh(element, pageSelectBox, itemSelectBox);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}

function getItems(element, values) {
  // get selected application
  var applicationId = domQuery('select[name="applicationId"]').value;
  // loading flag
  pagesLoading = true;
  // ajax process
  apex.server.process(
    'GET_ITEMS',
    {
      x01: applicationId,
      x02: values.pageId,
    },
    {
      dataType: 'text',
      success: function (data) {
        items = JSON.parse(data);
        pagesLoading = false;
        enableAndRefresh(element, itemSelectBox);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}

function getEntries(element) {
  var bo = getBusinessObject(element);
  const [apexPage] = extensionElementsHelper.getExtensionElements(
    bo,
    'apex:ApexPage'
  );
  return apexPage && apexPage.pageItems;
}

function getSelectedEntry(element, node) {
  var selection;
  var entry;

  if (pageItemsElement.getSelected(element, node).idx > -1) {
    selection = pageItemsElement.getSelected(element, node);
    entry = getEntries(element)[selection.idx];
  }

  return entry;
}

export default function (element, bpmnFactory, translate) {
  const userTaskProps = [];

  // Only return an entry, if the currently selected element is a UserTask.
  if (
    is(element, 'bpmn:UserTask') &&
    (typeof getBusinessObject(element).type === 'undefined' ||
      getBusinessObject(element).type === 'apexPage')
  ) {
    // refresh link
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'refreshMetadata',
        buttonLabel: 'Refresh Meta Data',
        handleClick: function (element, node, event) {
          return getApplications(element);
        },
      })
    );

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
        return metadataLoading;
      },

      get: getProperty('applicationId'),

      set: function (element, values, node) {
        // refresh pages
        getPages(element, values);
        // set value
        return setProperty(element, bpmnFactory, values);
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
        return applicationLoading || metadataLoading;
      },

      get: getProperty('pageId'),

      set: function (element, values, node) {
        // refresh items
        getItems(element, values);
        // set value
        return setProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(pageSelectBox);

    pageItemsElement = extensionElementsEntry(element, bpmnFactory, {
      id: 'pageItems',
      label: translate('Page Items'),

      createExtensionElement: newElement(bpmnFactory, {
        itemName: '',
        itemValue: '',
      }),
      removeExtensionElement: removeElement(),

      getExtensionElements: function (element) {
        return getEntries(element);
      },

      setOptionLabelValue: setOptionLabelValue(),
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
        return pagesLoading || applicationLoading || metadataLoading;
      },

      get: getExtProperty('itemName'),

      set: setExtProperty(),

      hidden: isNotSelected(),
    });

    userTaskProps.push(itemSelectBox);

    // name field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'itemValue',
        description: translate('Value of the page item'),
        label: translate('Item Value'),
        modelProperty: 'itemValue',

        get: getExtProperty('itemValue'),

        set: setExtProperty(),

        hidden: isNotSelected(),
      })
    );

    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'request',

        get: getProperty('request'),

        set: function (element, values) {
          // set value
          return setProperty(element, bpmnFactory, values);
        },
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'cache',

        get: getProperty('cache'),

        set: function (element, values) {
          // set value
          return setProperty(element, bpmnFactory, values);
        },
      })
    );
  }

  return userTaskProps;
}
