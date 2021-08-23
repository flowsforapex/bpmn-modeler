

var {escapeHTML} = require('bpmn-js-properties-panel/lib/Utils');

var {domify} = require('min-dom');
var domQuery = require('min-dom').query;

var forEach = require('lodash/forEach');

var entryFieldDescription = require('./dynamicEntryFieldDescription');


var isList = function (list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function (list) {
  return list.concat([{ name: '', value: '' }]);
};

var createOption = function (option) {
  return `<option value="${option.value}">${option.name}</option>`;
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {function} options.hidden
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
var selectbox = function (translate, options, defaultParameters) {
  var resource = defaultParameters;
  var label = options.label || resource.id;
  var selectOptions = options.selectOptions || [{ name: '', value: '' }];
  var {modelProperty} = options;
  var {emptyParameter} = options;
  var canBeDisabled = !!options.disabled && typeof options.disabled === 'function';
  var canBeHidden = !!options.hidden && typeof options.hidden === 'function';
  var {description} = options;
  var {dataValueDescription} = options;

  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }


  resource.html =
    domify(`<label for="camunda-${escapeHTML(resource.id)}"${ 
    canBeDisabled ? 'data-disable="isDisabled" ' : '' 
    }${canBeHidden ? 'data-show="isHidden" ' : '' 
    }>${escapeHTML(label)}</label>` +
    `<select id="camunda-${escapeHTML(resource.id)}-select" name="${ 
    escapeHTML(modelProperty)}"${ 
    canBeDisabled ? 'data-disable="isDisabled" ' : '' 
    }${canBeHidden ? 'data-show="isHidden" ' : '' 
    } data-value></select>`);

  var select = domQuery('select', resource.html);

  if (isList(selectOptions)) {
    forEach(selectOptions, function (option) {
      select.appendChild(
        domify(
          `<option value="${escapeHTML(option.value) 
          }${option.title ? `" title="${escapeHTML(option.title)}` : '' 
          }">${ 
          option.name ? escapeHTML(option.name) : '' 
          }</option>`
        )
      );
    });
  }

  // add description below select box entry field
  if ((description || dataValueDescription) && typeof options.showCustomInput !== 'function') {
    resource.html.appendChild(entryFieldDescription(translate, description, dataValueDescription, { show: canBeHidden && 'isHidden' }));
  }

  /**
   * Fill the select box options dynamically.
   *
   * Calls the defined function #selectOptions in the entry to get the
   * values for the options and set the value to the inputNode.
   *
   * @param {djs.model.Base} element
   * @param {HTMLElement} entryNode
   * @param {EntryDescriptor} inputNode
   * @param {Object} inputName
   * @param {Object} newValue
   */
  resource.setControlValue = function (element, entryNode, inputNode, inputName, newValue) {
    if (typeof selectOptions === 'function') {

      var options = selectOptions(element, inputNode);

      if (options) {

        // remove existing options
        while (inputNode.firstChild) {
          inputNode.removeChild(inputNode.firstChild);
        }

        // add options
        forEach(options, function (option) {
          var template = domify(createOption(option));

          inputNode.appendChild(template);
        });


      }
    }

    // set select value
    if (newValue !== undefined) {
      inputNode.value = newValue;
    }

  };

  if (canBeDisabled) {
    resource.isDisabled = function () {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function () {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-dropdown'];

  return resource;
};

module.exports = selectbox;
