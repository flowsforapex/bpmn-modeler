

var EntryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var {getBusinessObject} = require('bpmn-js/lib/util/ModelUtil');
var dynamicTextBox = require('./dynamicTextBox');
var dynamicSelectBox = require('./dynamicSelectBox');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

// helper from default EntryFactory

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(`${prop} must be set.`);
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
var setDefaultParameters = function (options) {

  // default method to fetch the current value of the input field
  var defaultGet = function (element) {
    var bo = getBusinessObject(element);
        var res = {};
        var prop = ensureNotNull(options.modelProperty);
    res[prop] = bo.get(prop);

    return res;
  };

  // default method to set a new value to the input field
  var defaultSet = function (element, values) {
    var res = {};
        var prop = ensureNotNull(options.modelProperty);
    if (values[prop] !== '') {
      res[prop] = values[prop];
    } else {
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

  // default validation method
  var defaultValidate = function () {
    return {};
  };

  return {
    id: options.id,
    description: (options.description || ''),
    get: (options.get || defaultGet),
    set: (options.set || defaultSet),
    validate: (options.validate || defaultValidate),
    html: ''
  };
};

// custom TextBox

EntryFactory.dynamicTextBox = function (translate, options) {
    return dynamicTextBox(translate, options, setDefaultParameters(options));
};

// custom SelectBox

EntryFactory.dynamicSelectBox = function (translate, options) {
  return dynamicSelectBox(translate, options, setDefaultParameters(options));
};

module.exports = EntryFactory;
