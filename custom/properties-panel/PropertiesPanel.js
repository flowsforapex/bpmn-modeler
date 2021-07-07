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
    
  var mousePosition;
  const BORDER_WIDTH = 5;
  const LEFT_SPACE = 100;
  
  parentNode.addEventListener('mousedown', function(event) {
    if (event.offsetX < BORDER_WIDTH) {
      mousePosition = event.x;
      document.addEventListener("mousemove", resize, false);
    }
  });

  parentNode.addEventListener('mouseup', function() {
    document.removeEventListener("mousemove", resize, false);
  });

  function resize(event) {
    if (mousePosition < (LEFT_SPACE - BORDER_WIDTH) || mousePosition > window.innerWidth - parseInt(getComputedStyle(parentNode).minWidth) - BORDER_WIDTH) {
      document.removeEventListener("mousemove", resize, false);
    }
    const dx = mousePosition - event.x;
    mousePosition = event.x;
    var panelWidth = (parseInt(getComputedStyle(parentNode, '').width) + dx);
    if (panelWidth > parseInt(getComputedStyle(parentNode).minWidth) && mousePosition >= LEFT_SPACE) {
      parentNode.style.width = panelWidth + "px";
      parentNode.firstChild.style.width = panelWidth + "px";
    }
  }

  // end custom part

  this._emit('attach');
}

module.exports = PropertiesPanel;