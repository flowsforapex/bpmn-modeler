'use strict';

var domify = require('min-dom').domify;

var escapeHTML = require('bpmn-js-properties-panel/lib/Utils').escapeHTML;

var entryFieldDescription = require('./dynamicEntryFieldDescription');


var textBox = function(translate, options, defaultParameters) {

  var resource = defaultParameters,
      label = options.label || resource.id,
      canBeShown = !!options.show && typeof options.show === 'function',
      description = options.description,
      dataValueLabel = options.dataValueLabel,
      dataValueDescription = options.dataValueDescription;

  resource.html =
    domify('<label for="camunda-' + escapeHTML(resource.id) + '" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    (dataValueLabel ? 'data-value="' + dataValueLabel + '"' : '') +
    '>' + label + '</label>' +
    '<div class="bpp-field-wrapper" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    '>' +
      '<div contenteditable="true" id="camunda-' + escapeHTML(resource.id) + '" ' +
            'name="' + escapeHTML(options.modelProperty) + '" />' +
    '</div>');

  // add description below text box entry field
  if (description || dataValueDescription) {
    resource.html.appendChild(entryFieldDescription(translate, description, dataValueDescription, { show: canBeShown && 'isShown' }));
  }

  if (canBeShown) {
    resource.isShown = function() {
      return options.show.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textbox'];

  return resource;
};

module.exports = textBox;