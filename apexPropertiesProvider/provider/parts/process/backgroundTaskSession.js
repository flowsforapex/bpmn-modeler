import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import {
  getApplications,
  getPages,
  getUsernames
} from '../../plugins/metaDataCollector';

var domQuery = require('min-dom').query;
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

// element identifier for current element
var elementIdentifier;

// select list options container
var applications = [];
var pages = [];
var usernames = [];

// select box container
var applicationSelectBox;
var pageSelectBox;
var usernameSelectBox;

// loading flags
var applicationsLoading;
var pagesLoading;
var usernamesLoading;

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
      property = getBusinessObject(element).get('applicationId') || null;
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
      property = getBusinessObject(element).get('pageId') || null;
      // add entry if not contained
      if (property != null && !pages.map(e => e.value).includes(property)) {
        pages.unshift({ name: `${property}*`, value: property });
      }
      // refresh select box
      newPageId = enableAndResetValue(element, pageSelectBox, property);
    }
  });
}

function refreshUsernames(element) {
  var property;
  var newUsername;
  // loading flag
  usernamesLoading = true;
  // ajax process
  getUsernames().then((values) => {
    // loading flag
    usernamesLoading = false;
    if (values) {
      usernames = values;
      // get property value
      property = getBusinessObject(element).get('username') || null;
      // add entry if not contained
      if (
        property != null &&
        !usernames.map(e => e.value).includes(property)
      ) {
        usernames.unshift({ name: `${property}*`, value: property });
      }
      // refresh select box
      newUsername = enableAndResetValue(element, usernameSelectBox, property);
    }
  });
}

export default function (group, element, translate) {
  if (is(element, 'bpmn:Process')) {
    // manualInput switch
    group.entries.push(
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
      label: translate('Default Application'),
      modelProperty: 'applicationId',
      selectOptions: function () {
        return applications;
      },
      disabled: function () {
        return applicationsLoading;
      },
      hidden: function () {
        return getBusinessObject(element).manualInput === 'true';
      },
      get: function (element) {
        // refresh applications (if necessary)
        if (elementIdentifier !== element) {
          elementIdentifier = element;
          // initiate ajax call for meta data
          refreshApplications(element);
          refreshUsernames(element);
        }
        var value = getBusinessObject(element).get('applicationId');
        // add entry if not contained
        if (
          value != null &&
          !applications.map(e => e.value).includes(value)
        ) {
          // filter out old custom entries
          applications = applications.filter(a => !a.name.endsWith('*'));
          // add entry
          applications.unshift({
            name: `${value}*`,
            value: value,
          });
        }
        return {
          applicationId: value,
        };
      },
      set: function (element, values, node) {
        // refresh pages
        refreshPages(element, values.applicationId);
        // set value
        var bo = getBusinessObject(element);
        return cmdHelper.updateBusinessObject(element, bo, values);
      },
    });

    group.entries.push(applicationSelectBox);

    // application text field
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'applicationIdText',
        label: translate('Default Application'),
        modelProperty: 'applicationId',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },
      })
    );

    // page select list
    pageSelectBox = entryFactory.selectBox(translate, {
      id: 'pageId',
      // description: translate('Default Application'),
      label: translate('Default Page'),
      modelProperty: 'pageId',
      selectOptions: function () {
        return pages;
      },
      disabled: function () {
        return applicationsLoading || pagesLoading;
      },
      hidden: function () {
        return getBusinessObject(element).manualInput === 'true';
      },
      get: function (element) {
        var value = getBusinessObject(element).get('pageId');
        // add entry if not contained
        if (value != null && !pages.map(e => e.value).includes(value)) {
          // filter out old custom entries
          pages = pages.filter(a => !a.name.endsWith('*'));
          // add entry
          pages.unshift({
            name: `${value}*`,
            value: value,
          });
        }
        return {
          pageId: value,
        };
      },
      set: function (element, values, node) {
        // set value
        var bo = getBusinessObject(element);
        return cmdHelper.updateBusinessObject(element, bo, values);
      },
    });

    group.entries.push(pageSelectBox);

    // page text field
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'pageIdText',
        label: translate('Default Page'),
        modelProperty: 'pageId',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },
      })
    );

    // username select list
    usernameSelectBox = entryFactory.selectBox(translate, {
      id: 'username',
      // description: translate('Default Application'),
      label: translate('Default Username'),
      modelProperty: 'username',
      selectOptions: function () {
        return usernames;
      },
      disabled: function () {
        return usernamesLoading;
      },
      hidden: function () {
        return getBusinessObject(element).manualInput === 'true';
      },
      get: function (element) {
        var value = getBusinessObject(element).get('username');
        // add entry if not contained
        if (value != null && !usernames.map(e => e.value).includes(value)) {
          // filter out old custom entries
          usernames = usernames.filter(a => !a.name.endsWith('*'));
          // add entry
          usernames.unshift({
            name: `${value}*`,
            value: value,
          });
        }
        return {
          username: value,
        };
      },
      set: function (element, values, node) {
        // set value
        var bo = getBusinessObject(element);
        return cmdHelper.updateBusinessObject(element, bo, values);
      },
    });

    group.entries.push(usernameSelectBox);

    // username text field
    group.entries.push(
      entryFactory.textField(translate, {
        id: 'usernameText',
        label: translate('Default Username'),
        modelProperty: 'username',

        hidden: function (element) {
          return (
            typeof getBusinessObject(element).manualInput === 'undefined' ||
            getBusinessObject(element).manualInput === 'false'
          );
        },
      })
    );
  }
}
