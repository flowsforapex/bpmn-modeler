import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";
import bpmnModeler from ".";

var bpmnModeler = new BpmnModeler({
    container: canvas,
    propertiesPanel: {
      parent: '#js-properties-panel'
    },
    additionalModules: [
      propertiesPanelModule,
      propertiesProviderModule
    ],}}
    


async function init() {
  // viewer instance
  var BpmnModeler = new BpmnJS({
    container: "#canvas",
    additionalModules: [ propertiesPanelModule,
        propertiesProviderModule ]
  });

  async function openDiagram(bpmnXML) {
    // import diagram
    try {
      await bpmnModeler.importXML(bpmnXML);

      // access viewer components
      var canvas = bpmnModeler.get("canvas");
      var overlays = bpmnModeler.get("overlays");

      // zoom to fit full viewport
      canvas.zoom("fit-viewport");
    } catch (err) {
      console.error("could not import BPMN 2.0 diagram", err);
    }
  }

  var client = new XMLHttpRequest();
  client.open("GET", "/shipment_processes.txt");
  client.onreadystatechange = function () {
    openDiagram(client.responseText);
  };

  client.send();
}

init();