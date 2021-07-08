module.exports = {
  __depends__: [
    require('bpmn-js-properties-panel/lib/cmd'),
    require('diagram-js/lib/i18n/translate').default
  ],
  __init__: [ 'propertiesPanel' ],
  propertiesPanel: [ 'type', require('./PropertiesPanel') ]
};
