var { domify } = require('min-dom');

var { escapeHTML } = require('bpmn-js-properties-panel/lib/Utils');

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js');

var textBox = function (translate, options, defaultParameters) {
  var resource = defaultParameters;
  var label = options.label || resource.id;
  var canBeShown = !!options.show && typeof options.show === 'function';
  var { description } = options;

  resource.html = domify(
    `<label for="camunda-${escapeHTML(resource.id)}" ${
      canBeShown ? 'data-show="isShown"' : ''
    }>${label}</label>` +
      `<div class="bpp-field-wrapper" ${
        canBeShown ? 'data-show="isShown"' : ''
      }>` +
      `<div contenteditable="true" oninput="bpmnModeler.customFunctions.highlightSyntax(this)" onscroll="bpmnModeler.customFunctions.syncScroll(this)" spellcheck="false" id="camunda-${escapeHTML(
        resource.id
      )}" ` +
      `name="${escapeHTML(options.modelProperty)}" />` +
      '</div>' +
      '<pre id="highlighting" aria-hidden="true"><code class="language-plsql" id="highlighting-content"></code></pre>'
  );

  // add description below text box entry field
  if (description) {
    resource.html.appendChild(
      entryFieldDescription(translate, description, {
        show: canBeShown && 'isShown',
      })
    );
  }

  if (canBeShown) {
    resource.isShown = function () {
      return options.show.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textbox'];

  return resource;
};

module.exports = textBox;
