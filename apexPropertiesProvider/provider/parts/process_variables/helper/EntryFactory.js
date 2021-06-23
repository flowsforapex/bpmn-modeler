'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

// input entities
var textInputField = require('bpmn-js-properties-panel/lib/factory/TextInputEntryFactory'),
    checkboxField = require('bpmn-js-properties-panel/lib/factory/CheckboxEntryFactory'),
    selectBoxField = require('bpmn-js-properties-panel/lib/factory/SelectEntryFactory'),
    comboBoxField = require('bpmn-js-properties-panel/lib/factory/ComboEntryFactory'),
    textBoxField = require('bpmn-js-properties-panel/lib/factory/TextBoxEntryFactory'),
    validationAwareTextInputField = require('bpmn-js-properties-panel/lib/factory/ValidationAwareTextInput'),
    tableField = require('bpmn-js-properties-panel/lib/factory/TableEntryFactory'),
    labelEntry = require('bpmn-js-properties-panel/lib/factory/LabelFactory'),
    link = require('bpmn-js-properties-panel/lib/factory/LinkEntryFactory'),
    autoSuggestTextBoxField = require('bpmn-js-properties-panel/lib/factory/AutoSuggestTextBoxFactory'),
    collapsible = require('bpmn-js-properties-panel/lib/factory/CollapsibleEntryFactory'),
    toggleSwitch = require('bpmn-js-properties-panel/lib/factory/ToggleSwitchEntryFactory');

var dynamicTextBox = require('./dynamicTextBox');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

// helpers ////////////////////////////////////////

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(prop + ' must be set.');
  }

  return prop;
}

/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function),
 *            validate: (*|Function), html: string}}
 */
var setDefaultParameters = function(options) {

  // default method to fetch the current value of the input field
  var defaultGet = function(element) {
    var bo = getBusinessObject(element),
        res = {},
        prop = ensureNotNull(options.modelProperty);
    res[prop] = bo.get(prop);

    return res;
  };

  // default method to set a new value to the input field
  var defaultSet = function(element, values) {
    var res = {},
        prop = ensureNotNull(options.modelProperty);
    if (values[prop] !== '') {
      res[prop] = values[prop];
    } else {
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

  // default validation method
  var defaultValidate = function() {
    return {};
  };

  return {
    id : options.id,
    description : (options.description || ''),
    get : (options.get || defaultGet),
    set : (options.set || defaultSet),
    validate : (options.validate || defaultValidate),
    html: ''
  };
};

function EntryFactory() {

}

/**
 * Generates an text input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * - buttonAction: Object which contains the following properties: - Object
 * ---- name: name of the [data-action] callback - String
 * ---- method: callback function for [data-action] - Function
 *
 * - buttonShow: Object which contains the following properties: - Object
 * ---- name: name of the [data-show] callback - String
 * ---- method: callback function for [data-show] - Function
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
EntryFactory.textField = function(translate, options) {
  return textInputField(translate, options, setDefaultParameters(options));
};

EntryFactory.validationAwareTextField = function(translate, options) {
  return validationAwareTextInputField(translate, options, setDefaultParameters(options));
};

/**
 * Generates a checkbox input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation method - Function
 *
 * - modelProperty: name of the model property - String
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
EntryFactory.checkbox = function(translate, options) {
  return checkboxField(translate, options, setDefaultParameters(options));
};

EntryFactory.textBox = function(translate, options) {
  return textBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.selectBox = function(translate, options) {
  return selectBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.comboBox = function(translate, options) {
  return comboBoxField(translate, options);
};

EntryFactory.table = function(translate, options) {
  return tableField(translate, options);
};

EntryFactory.label = function(options) {
  return labelEntry(options);
};

EntryFactory.link = function(translate, options) {
  return link(translate, options);
};

EntryFactory.autoSuggest = function(translate, options) {
  return autoSuggestTextBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.collapsible = function(options) {
  return collapsible(options);
};

EntryFactory.toggleSwitch = function(translate, options) {
  return toggleSwitch(translate, options, setDefaultParameters(options));
};

EntryFactory.dynamicTextBox = function(translate, options) {
    return dynamicTextBox(translate, options, setDefaultParameters(options));
}

module.exports = EntryFactory;
