var PropertiesPanel = require('bpmn-js-properties-panel/lib/PropertiesPanel');

var domQuery = require('min-dom').query;
PropertiesPanel.prototype.attachTo = function(parentNode) {
  if (!parentNode) {
    throw new Error('parentNode required');
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  var container = this._container;

  parentNode.appendChild(container);

  // custom part for resizable properties panel

  var mouseX;
  const BORDER_WIDTH = 5;

  document.addEventListener('mousedown', function(event) {
    if (event.offsetX < BORDER_WIDTH) {
      mouseX = event.x;
      document.addEventListener("mousemove", resize, false);
    }
  });

  document.addEventListener('mouseup', function() {
    document.removeEventListener("mousemove", resize, false);
  });

  const canvas = this._canvas._container;

  function resize(event) {
    var dx = mouseX - event.x;
    mouseX = event.x;
    var panelWidth = (parseInt(getComputedStyle(parentNode, '').width) + dx);
    var maxWidth = (parseInt(getComputedStyle(canvas, '').width))/100 * parseInt(getComputedStyle(parentNode).maxWidth);
    if (panelWidth > parseInt(getComputedStyle(parentNode).minWidth) && panelWidth < maxWidth) {
      parentNode.style.width = panelWidth + "px";
      parentNode.firstChild.style.width = panelWidth + "px";
    }
  }

  // end custom part

  this._emit('attach');
}

module.exports = PropertiesPanel;