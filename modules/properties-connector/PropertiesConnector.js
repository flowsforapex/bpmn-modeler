// var {getBusinessObject} = require('bpmn-js/lib/util/ModelUtil');

/**
 * A properties panel implementation.
 *
 * To use it provide a `propertiesProvider` component that knows
 * about which properties to display.
 *
 * Properties edit state / visibility can be intercepted
 * via a custom {@link PropertiesActivator}.
 *
 * @class
 * @constructor
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {PropertiesProvider} propertiesProvider
 * @param {Canvas} canvas
 * @param {CommandStack} commandStack
 */
function PropertiesConnector(config, eventBus, modeling, propertiesProvider, commandStack, canvas) {

    this._eventBus = eventBus;
    this._modeling = modeling;
    this._commandStack = commandStack;
    this._canvas = canvas;
    this._propertiesProvider = propertiesProvider;

    this._init(config);
}

PropertiesConnector.$inject = [
    'config.propertiesConnector',
    'eventBus',
    'modeling',
    'propertiesProvider',
    'commandStack',
    'canvas'
];

module.exports = PropertiesConnector;

PropertiesConnector.prototype._init = function (config) {
    var canvas = this._canvas;
    var eventBus = this._eventBus;
    var that = this;

    window.console.log(canvas, eventBus, config, that);

    // require('./events').createEvents(eventBus);

    eventBus.on('root.added', function (e) {
        //
    });

    eventBus.on('selection.changed', function (e) {
        //
    });
};