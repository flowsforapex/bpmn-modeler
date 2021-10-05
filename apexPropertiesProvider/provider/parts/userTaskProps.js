import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var domQuery = require('min-dom').query;

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var factory;

var setProperty = function (element, values) {
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
};

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

var applications = [];
var pages = [];
var items = [];

export default function (element, translate) {
  const userTaskProps = [];

  var applicationSelectBox;
  // var applications = [];

  var pageSelectBox;
  // var pages = [];

  var itemSelectBox;
  // var items = [];

  var metadataLoading = false;
  var applicationLoading = false;
  var pagesLoading = false;

  var getMetaData = function () {
    return function (element, node, event) {
      // get dom nodes
      var applicationSelectBoxNode = domQuery(
        'div[data-entry="apex-application"] select'
      );
      var pageSelectBoxNode = domQuery('div[data-entry="apex-page"] select');
      var itemSelectBoxNode = domQuery('div[data-entry="apex-item"] select');
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
            // manually enable select box
            itemSelectBoxNode.removeAttribute('disabled');
            // refresh select box options
            itemSelectBox.setControlValue(
              element,
              null,
              itemSelectBoxNode,
              null,
              itemSelectBox.oldValues['apex-item']
            );
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('error');
          },
        }
      );
    };
  };

  factory = bpmnFactory;

  function refreshPages(element, values, node) {
    // get dom nodes
    var pageSelectBoxNode = domQuery('div[data-entry="apex-page"] select');
    var itemSelectBoxNode = domQuery('div[data-entry="apex-item"] select');
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
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('error');
        },
      }
    );
  }

  function refreshItems(element, values, node) {
    // get dom nodes
    var itemSelectBoxNode = domQuery('div[data-entry="apex-item"] select');
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
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('error');
        },
      }
    );
  }

  // Only return an entry, if the currently selected element is a UserTask.
  if (is(element, 'bpmn:UserTask')) {
    // refresh link
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'use-metadata',
        buttonLabel: 'Refresh Meta Data',
        handleClick: getMetaData(),
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

    // item select list
    itemSelectBox = entryFactory.selectBox(translate, {
      id: 'apex-item',
      description: translate('Page Items to set'),
      label: translate('Page Items'),
      modelProperty: 'apex-item',

      selectOptions: function () {
        return items;
      },

      disabled: function () {
        return pagesLoading || applicationLoading || metadataLoading;
      },
    });

    userTaskProps.push(itemSelectBox);

    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-value',
        description: translate('Page Item Values'),
        label: translate('Item Values'),
        modelProperty: 'apex-value',
      })
    );

    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-request',
        description: translate('Request Value for Page Call'),
        label: translate('Request'),
        modelProperty: 'apex-request',
        set: setProperty(),
        get: getProperty('apex-request'),
      })
    );
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'apex-cache',
        description: translate('Clear Cache Value for Page Call'),
        label: translate('Clear Cache'),
        modelProperty: 'apex-cache',
        set: setProperty(),
        get: getProperty('apex-cache'),
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

    userTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'apex-value',
        description: translate('Page Item Values'),
        label: translate('Item Values'),
        modelProperty: 'apex-value',
        set: setProperty(),
        get: getProperty('apex-value'),
      })
    );
  }

  return userTaskProps;
}
