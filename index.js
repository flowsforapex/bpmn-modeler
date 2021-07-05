import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './apexPropertiesProvider/provider';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';

import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from './.bpmnlintrc';

import customPaletteModule from './custom';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteModule
  },
  moddleExtensions: {
    apexModdleDescriptor
  }
};

export default bpmnModeler;
