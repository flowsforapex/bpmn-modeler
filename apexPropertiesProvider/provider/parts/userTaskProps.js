import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var domQuery = require('min-dom').query;

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var factory;

/** ********** */

var setOptionLabelValue = function () {
  return function (element, node, option, property, value, idx) {
    var entries = getEntries(element);
    var entry = entries[idx];

    var label = entry ? `${entry.get('item-name')}:${entry.get('item-value')}` : '';

    option.text = label;
    option.value = entry && entry.get('item-name');
  };
};

var newElement = function (bpmnFactory, props) {
  return function (element, extensionElements, values) {
    var commands = [];

    var container =
      extensionElementsHelper.getExtensionElements(
        getBusinessObject(element),
        'apex:ApexPage'
      ) &&
      extensionElementsHelper.getExtensionElements(
        getBusinessObject(element),
        'apex:ApexPage'
      )[0];

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
      'item-name': props['item-name'],
      'item-value': props['item-value'],
    };

    // eslint-disable-next-line vars-on-top
    var newElem = elementHelper.createElement(
      'apex:PageItem',
      values,
      container,
      bpmnFactory
    );
    commands.push(
      cmdHelper.addElementsTolist(element, container, 'apex-item', [newElem])
    );

    return commands;
  };
};

var removeElement = function () {
  return function (element, extensionElements, value, idx) {
    var container =
      extensionElementsHelper.getExtensionElements(
        getBusinessObject(element),
        'apex:ApexPage'
      ) &&
      extensionElementsHelper.getExtensionElements(
        getBusinessObject(element),
        'apex:ApexPage'
      )[0];

    var entries = getEntries(element);
    var entry = entries[idx];
    if (entry) {
      // eslint-disable-next-line vars-on-top
      var command =
        container.get('apex-item').length > 1 ? cmdHelper.removeElementsFromList(
              element,
              container,
              'apex-item',
              'extensionElements',
              [entry]
            ) : cmdHelper.removeElementsFromList(
              element,
              extensionElements,
              'values',
              'extensionElements',
              [container]
            );
      return command;
    }
  };
};

// property getter
var getProperty = function (property) {
  return function (element) {
    var bo = getBusinessObject(element);

    const apexPage =
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage') &&
      extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage')[0];

    return {
      [property]: apexPage && apexPage.get(property),
    };
  };
};

var isNotSelected = function () {
  return function (element, node) {
    return typeof getSelectedEntry(element, node) === 'undefined';
  };
};

// select list options container
var applications = [];
var pages = [];
var items = [];

var pageItemsElement;

function getEntries(element) {
  var bo = getBusinessObject(element);
  return bo &&
    extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage') &&
    extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage')[0] ? extensionElementsHelper
        .getExtensionElements(bo, 'apex:ApexPage')[0]
        .get('apex-item') : [];
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

// property setter
function setProperty(element, values) {
  var commands = [];
  var bo = getBusinessObject(element);
  var extensions = bo.extensionElements;

  if (!extensions) {
    extensions = elementHelper.createElement(
      'bpmn:ExtensionElements',
      {},
      bo,
      factory
    );
    commands.push(
      cmdHelper.updateProperties(element, { extensionElements: extensions })
    );
  }

  let apexPage =
    extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage') &&
    extensionElementsHelper.getExtensionElements(bo, 'apex:ApexPage')[0];

  if (!apexPage) {
    apexPage = elementHelper.createElement(
      'apex:ApexPage',
      {},
      extensionElementsHelper,
      factory
    );
    commands.push(
      cmdHelper.addElementsTolist(element, extensions, 'values', [apexPage])
    );
  }

  commands.push(cmdHelper.updateBusinessObject(element, apexPage, values));

  return commands;
}

export default function (element, bpmnFactory, translate) {
  const userTaskProps = [];

  // select box container
  var applicationSelectBox;
  var pageSelectBox;
  var itemSelectBox;

  // loading flags
  var metadataLoading = false;
  var applicationLoading = false;
  var pagesLoading = false;

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

  var getApplications = function () {
    return function (element, node, event) {
      // get dom nodes
      var applicationSelectBoxNode = domQuery(
        'div[data-entry="apex-application"] select'
      );
      var pageSelectBoxNode = domQuery('div[data-entry="apex-page"] select');
      var itemSelectBoxNode = domQuery('div[data-entry="item-name"] select');
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
            // manually enable select box
            applicationSelectBoxNode.removeAttribute('disabled');
            // refresh select box options
            applicationSelectBox.setControlValue(
              element,
              null,
              applicationSelectBoxNode,
              null,
              applicationSelectBox.oldValues['apex-application']
            );
            // manually enable select box
            pageSelectBoxNode.removeAttribute('disabled');
            // refresh select box options
            pageSelectBox.setControlValue(
              element,
              null,
              pageSelectBoxNode,
              null,
              pageSelectBox.oldValues['apex-page']
            );
            if (itemSelectBoxNode) {
              // manually enable select box
              itemSelectBoxNode.removeAttribute('disabled');
              // refresh select box options
              itemSelectBox.setControlValue(
                element,
                null,
                itemSelectBoxNode,
                null,
                itemSelectBox.oldValues['item-name']
              );
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('error');
          },
        }
      );
    };
  };

  function refreshPages(element, values, node) {
    // get dom nodes
    var pageSelectBoxNode = domQuery('div[data-entry="apex-page"] select');
    var itemSelectBoxNode = domQuery('div[data-entry="item-name"] select');
    // loading flag
    applicationLoading = true;
    // ajax process
    apex.server.process(
      'GET_PAGES',
      { x01: values['apex-application'] },
      {
        dataType: 'text',
        success: function (data) {
          pages = JSON.parse(data);
          applicationLoading = false;
          // manually enable select box
          pageSelectBoxNode.removeAttribute('disabled');
          // refresh select box options
          pageSelectBox.setControlValue(
            element,
            null,
            pageSelectBoxNode,
            null,
            null
          );
          if (itemSelectBoxNode) {
            // manually enable select box
            itemSelectBoxNode.removeAttribute('disabled');
            // refresh select box options
            itemSelectBox.setControlValue(
              element,
              null,
              itemSelectBoxNode,
              null,
              null
            );
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('error');
        },
      }
    );
  }

  function refreshItems(element, values, node) {
    // get dom nodes
    var itemSelectBoxNode = domQuery('div[data-entry="item-name"] select');
    // loading flag
    pagesLoading = true;
    // ajax process
    apex.server.process(
      'GET_ITEMS',
      {
        x01: applicationSelectBox.oldValues['apex-application'],
        x02: values['apex-page'],
      },
      {
        dataType: 'text',
        success: function (data) {
          items = JSON.parse(data);
          pagesLoading = false;
          if (itemSelectBoxNode) {
            // manually enable select box
            itemSelectBoxNode.removeAttribute('disabled');
            // refresh select box options
            itemSelectBox.setControlValue(
              element,
              null,
              itemSelectBoxNode,
              null,
              null
            );
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('error');
        },
      }
    );
  }

  factory = bpmnFactory;

  // Only return an entry, if the currently selected element is a UserTask.
  if (is(element, 'bpmn:UserTask')) {
    // refresh link
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'use-metadata',
        buttonLabel: 'Refresh Meta Data',
        handleClick: getApplications(),
      })
    );

    // applications select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'apex-application',
      description: translate('Application ID or Alias'),
      label: translate('Application'),
      modelProperty: 'apex-application',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return metadataLoading;
      },

      get: getProperty('apex-application'),

      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values, node);
        // set value
        return setProperty(element, values);
      },
    });

    userTaskProps.push(applicationSelectBox);

    // page select list
    pageSelectBox = entryFactory.selectBox(translate, {
      id: 'apex-page',
      description: translate('Page ID or Alias'),
      label: translate('Page'),
      modelProperty: 'apex-page',

      selectOptions: function () {
        return pages;
      },

      disabled: function () {
        return applicationLoading || metadataLoading;
      },

      get: getProperty('apex-page'),

      set: function (element, values, node) {
        // refresh items
        refreshItems(element, values, node);
        // set value
        return setProperty(element, values);
      },
    });

    userTaskProps.push(pageSelectBox);

    /* */

    pageItemsElement = extensionElementsEntry(element, bpmnFactory, {
      id: 'apex-item',
      label: translate('Page Items'),

      createExtensionElement: newElement(bpmnFactory, {
        'item-name': '',
        'item-value': '',
      }),
      removeExtensionElement: removeElement(),

      getExtensionElements: function (element) {
        return getEntries(element);
      },

      setOptionLabelValue: setOptionLabelValue(),
    });

    userTaskProps.push(pageItemsElement);

    /* */

    // name field
    // userTaskProps.push(
    //   entryFactory.textField(translate, {
    //     id: 'itemName',
    //     description: translate('Name of the page item'),
    //     label: translate('Item Name'),
    //     modelProperty: 'itemName',

    //     get: getExtProperty('itemName'),

    //     set: setExtProperty(),

    //     hidden: isNotSelected(),
    //   })
    // );

    // item select list
    itemSelectBox = entryFactory.selectBox(translate, {
      id: 'item-name',
      escription: translate('Name of the page item'),
      label: translate('Item Name'),
      modelProperty: 'item-name',

      selectOptions: function () {
        return items;
      },

      disabled: function () {
        return pagesLoading || applicationLoading || metadataLoading;
      },

      get: getExtProperty('item-name'),

      set: setExtProperty(),

      hidden: isNotSelected(),
    });

    userTaskProps.push(itemSelectBox);

    // name field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'item-value',
        description: translate('Value of the page item'),
        label: translate('Item Value'),
        modelProperty: 'item-value',

        get: getExtProperty('item-value'),

        set: setExtProperty(),

        hidden: isNotSelected(),
      })
    );

    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'apex-request',

        get: getProperty('apex-request'),

        set: function (element, values) {
          // set value
          return setProperty(element, values);
        },
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'apex-cache',

        get: getProperty('apex-cache'),

        set: function (element, values) {
          // set value
          return setProperty(element, values);
        },
      })
    );
    // userTaskProps.push(
    //   entryFactory.textBox(translate, {
    //     id: 'apex-item',
    //     description: translate('Page Items to set'),
    //     label: translate('Page Items'),
    //     modelProperty: 'apex-item'
    //   })
    // );
  }

  return userTaskProps;
}
