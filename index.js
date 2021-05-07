import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './apexPropertiesProvider/provider';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import camundaModule from 'bpmn-js-properties-panel/lib/provider/camunda';

import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from './.bpmnlintrc'; 

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    camundaModule,
    propertiesProviderModule,
    lintModule
  },
  moddleExtensions: {
    apexModdleDescriptor,
    camundaModdleDescriptor
  }
};

export default bpmnModeler;