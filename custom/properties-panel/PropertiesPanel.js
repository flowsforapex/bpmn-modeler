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
  
  parentNode.addEventListener('mousedown', function(event) {
    if (event.offsetX < 5) {
      mousePosition = event.x;
      document.addEventListener("mousemove", resize, false);
    }
  });

  parentNode.addEventListener('mouseup', function() {
    document.removeEventListener("mousemove", resize, false);
  });

  function resize(event) {
    if (event.offsetX < 1900) {
      const dx = mousePosition - event.x;
      mousePosition = event.x;
      var panelWidth = (parseInt(getComputedStyle(parentNode, '').width) + dx);
      if (panelWidth > 260) {
        parentNode.style.width = panelWidth + "px";
        parentNode.firstChild.style.width = panelWidth + "px";
      }
    } else {
      document.removeEventListener("mousemove", resize, false);
    }
  }

  // end custom part

  this._emit('attach');
}

module.exports = PropertiesPanel;