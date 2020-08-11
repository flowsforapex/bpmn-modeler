import BpmnModeler from "bpmn-js/lib/Modeler";

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";

var bpmnModeler = {
  Modeler: BpmnModeler,
  modules: {
    propertiesPanelModule,
    propertiesProviderModule
  }
};

export default bpmnModeler;
