import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "./apexPropertiesProvider/provider";
import apexModdleDescriptor from "./apexPropertiesProvider/descriptor/apexProps";

var bpmnModeler = {
  Modeler: BpmnModeler,
  modules: {
    propertiesPanelModule,
    propertiesProviderModule
  },
  moddleExtensions: {
    apexModdleDescriptor
  }
};

export default bpmnModeler;
