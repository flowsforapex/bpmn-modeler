import bpmnModeler from "./index.js";


// viewer instance
var myModeler = new bpmnModeler.Modeler({
  container: "#canvas",
  propertiesPanel: {
    parent: '#properties'
  },
  linting: {
    bpmnlint: bpmnModeler.linting.apexLinting
  },
  additionalModules: [
    bpmnModeler.customModules.propertiesPanelModule,
    bpmnModeler.customModules.propertiesProviderModule,
    bpmnModeler.customModules.lintModule
  ],
  moddleExtensions: {
    apex: bpmnModeler.moddleExtensions.apexModdleDescriptor
  }
});

async function init() {

  openDiagram();

  async function openDiagram() {
    const defaultDiagram =
      "<?xml version='1.0' encoding='UTF-8'?>" +
      "<bpmn:definitions xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:bpmn='http://www.omg.org/spec/BPMN/20100524/MODEL' xmlns:bpmndi='http://www.omg.org/spec/BPMN/20100524/DI' id='Definitions_1wzb475' targetNamespace='http://bpmn.io/schema/bpmn' exporter='bpmn-js (https://demo.bpmn.io)' exporterVersion='7.2.0'>" +
      "<bpmn:process id='Process_0rxermh' isExecutable='false' />" +
      "<bpmndi:BPMNDiagram id='BPMNDiagram_1'>" +
      "<bpmndi:BPMNPlane id='BPMNPlane_1' bpmnElement='Process_0rxermh' />" +
      "</bpmndi:BPMNDiagram>" +
      "</bpmn:definitions>";

    // import diagram
    try {
      await myModeler.importXML(defaultDiagram);

      // access viewer components
      var canvas = myModeler.get("canvas");
      var overlays = myModeler.get("overlays");

      // zoom to fit full viewport
      canvas.zoom("fit-viewport");
    } catch (err) {
      console.error("could not import BPMN 2.0 diagram", err);
    }
  }
}

init();

export default { modeler: myModeler, init: init };
