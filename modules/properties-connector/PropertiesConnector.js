var BpmnViewer = require('bpmn-js/lib/Modeler');

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

    this._demoRootNode = null;
    this._currentXml = null;
    this._currentElement = null;

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
    const canvas = this._canvas;
    const eventBus = this._eventBus;
    const that = this;
    const parentNode = document.querySelector('.mtag-bpmn-modeler');

    eventBus.on('root.added', function () {
        if (config.showDemoBox) {
            that.demoRootNode = that.createAndAppendDemoBox(parentNode, config);
        }
    });

    // eventBus.on('saveXML.start', (e) => {
    //     console.log(e);
    //     that._currentXml = e;
    // });

    eventBus.on('selection.changed', function (e) {
        if (that.demoRootNode) {
            const [selectedShape] = e.newSelection;
            const inputShapeType = that.demoRootNode.querySelector('#shapeType');
            const inputBoId = that.demoRootNode.querySelector('#boId');
            const inputBoName = that.demoRootNode.querySelector('#boName');

            that._currentElement = selectedShape;

            if (selectedShape) {
                inputShapeType.value = selectedShape.type;
                inputBoId.value = selectedShape.businessObject.id;
                inputBoName.value = selectedShape.businessObject.name || '';
            } else {
                inputShapeType.value = '';
                inputBoId.value = '';
                inputBoName.value = '';
            }
        }
    });
};

PropertiesConnector.prototype.createAndAppendDemoBox = function (parentNode, config) {
    const that = this;
    const boxElement = document.createElement('div');
    const boxHeader = document.createElement('h2');
    const boxHeaderSub = document.createElement('p');
    const boxInputBoType = document.createElement('input');
    const boxInputBoId = document.createElement('input');
    const boxInputBoName = document.createElement('input');
    const elemStyle = boxElement.style;
    const boxInputBoTypeStyle = boxInputBoType.style;
    const boxInputBoIdStyle = boxInputBoId.style;
    const boxInputBoNameStyle = boxInputBoName.style;

    boxHeader.innerHTML = 'Demo';
    boxHeader.style.color = '#444';
    boxHeader.style.marginBottom = '5px';
    
    boxHeaderSub.innerHTML = `This is a demo panel to show the functionality of this properties connector.
    It can be switched off in the app's configuration.`;
    boxHeaderSub.style.color = '#666';
    boxHeaderSub.style.margin = '5px 0 10px';

    boxInputBoType.type = 'text';
    boxInputBoType.id = 'shapeType';
    boxInputBoType.placeholder = 'Typ';
    boxInputBoType.disabled = true;
    boxInputBoTypeStyle.padding = '10px 15px';
    boxInputBoTypeStyle.marginBottom = '10px';
    boxInputBoTypeStyle.width = '100%';

    boxInputBoId.type = 'text';
    boxInputBoId.id = 'boId';
    boxInputBoId.placeholder = 'ID';
    boxInputBoIdStyle.padding = '10px 15px';
    boxInputBoIdStyle.marginBottom = '10px';
    boxInputBoIdStyle.width = '100%';

    boxInputBoName.type = 'text';
    boxInputBoName.id = 'boName';
    boxInputBoName.placeholder = 'Name';
    boxInputBoNameStyle.padding = '10px 15px';
    boxInputBoNameStyle.marginBottom = '10px';
    boxInputBoNameStyle.width = '100%';

    elemStyle.height = '100%';
    elemStyle.width = '300px';
    elemStyle.background = '#ddd';
    elemStyle.borderLeft = 'solid 1px #ccc';
    elemStyle.position = 'absolute';
    elemStyle.top = 0;
    elemStyle.right = 0;
    elemStyle.zIndex = 10;
    elemStyle.padding = 15;
    elemStyle.boxSizing = 'border-box';

    boxElement.appendChild(boxHeader);
    boxElement.appendChild(boxHeaderSub);
    boxElement.appendChild(boxInputBoType);
    boxElement.appendChild(boxInputBoId);
    boxElement.appendChild(boxInputBoName);

    boxInputBoId.addEventListener('change', (e) => {
        that._commandStack.execute('element.updateProperties', {
            element: that._currentElement,
            properties: { id: e.target.value }
        });  
    });

    boxInputBoName.addEventListener('change', (e) => {
        that._commandStack.execute('element.updateProperties', {
            element: that._currentElement,
            properties: { name: e.target.value }
        });  
    });

    if (config.showSaveBtn) {
        const boxSaveBtn = document.createElement('button');

        boxSaveBtn.innerHTML = 'Save XML to console';
        boxSaveBtn.style.marginBlockEnd = '10px';
        boxSaveBtn.addEventListener('click', (e) => {

        });
        boxElement.appendChild(boxSaveBtn);
    }

    if (config.showObjBtn) {
        const boxObjBtn = document.createElement('button');

        boxObjBtn.innerHTML = 'Save object to console';
        boxObjBtn.style.marginBottom = '10px';
        boxObjBtn.style.padding = '10px 15px';
        boxObjBtn.addEventListener('click', (e) => {
            window.console.log('Object sent to APEX', {
                type: boxInputBoType.value,
                id: boxInputBoId.value,
                name: boxInputBoName.value
            });
        });
        boxElement.appendChild(boxObjBtn);
    }

    parentNode.appendChild(boxElement);

    return boxElement;
};
