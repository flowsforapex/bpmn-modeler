import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";

import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from './.bpmnlintrc'; 

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: {
    bpmnlint: bpmnlintConfig
  },
  modules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule
  }
};

export default bpmnModeler;
