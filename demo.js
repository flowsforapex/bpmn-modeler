import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";


import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from 'bpmnlint-Rules/.bpmnlintrc';


async function init() {
  // viewer instance
  var bpmnModeler = new BpmnModeler({
    container: "#canvas",
    propertiesPanel: {
      parent: '#properties'
    },
    linting: {
      bpmnlint: bpmnlintConfig,
      active: getUrlParam('linting')
    },
    additionalModules: [
      propertiesPanelModule,
      propertiesProviderModule,
      lintModule
    ]
  });

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
      await bpmnModeler.importXML(defaultDiagram);

      // access viewer components
      var canvas = bpmnModeler.get("canvas");
      var overlays = bpmnModeler.get("overlays");

      // zoom to fit full viewport
      canvas.zoom("fit-viewport");
    } catch (err) {
      console.error("could not import BPMN 2.0 diagram", err);
    }
  }


bpmnModeler.on('linting.toggle', function(event) {

  var active = event.active;

  setUrlParam('linting', active);
});


// helpers /////////////////////////////////

function setUrlParam(name, value) {

  var url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(name, 1);
  } else {
    url.searchParams.delete(name);
  }

  window.history.replaceState({}, null, url.href);
}

function getUrlParam(name) {
  var url = new URL(window.location.href);

  return url.searchParams.has(name);
}
}
init();
