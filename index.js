import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "./apexPropertiesProvider/provider";
import apexModdleDescriptor from "./apexPropertiesProvider/descriptor/apexProps";

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
  },
  moddleExtensions: {
    apexModdleDescriptor
  }
};

export default bpmnModeler;
